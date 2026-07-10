/**
 * Weekly digest generator (Wave 3-C3)
 *
 * 週次/月次の retention メール本文を生成する。読者の旅行検討を直接 affiliate
 * 誘導するための editorial 体裁のテンプレート:
 *
 *   1. 今週の TOP 5 ディール (discount% 順、active deals から)
 *   2. 今週追加された seasons / 編集記事 (あれば)
 *   3. 編集部おすすめ luxury ホテル 3 件 (curated)
 *   4. footer: 配信解除 + 帰属 + 著作権
 *
 * 出力 HTML は email クライアント互換性を最優先に inline CSS + テーブル組み。
 * 全 ASP リンクには UTM (utm_source=newsletter&utm_medium=email&utm_campaign=
 * weekly_digest_{YYYYMMDD}) を付与し、メール起点クリックを /api/clicks 経由で
 * 計測できるようにする。
 */

import { getActiveDeals } from "@/lib/deals/deal-service";
import { getAllArticles } from "@/lib/articles/get-all-articles";
import { airlines } from "@/data/airlines";
import { getAirlineSaleStats } from "@/data/sale-history";
import { CURATED_HOTELS } from "@/data/hotel-curated";
import { HOTEL_BY_SLUG } from "@/data/hotel-destinations";
import { unsubscribeUrl } from "./token";
import { SITE_URL as SITE } from "@/lib/email/client";
import type { DealSchema } from "@/data/deal-schema";
import type { Article } from "@/data/mock-articles";
import type { CuratedHotel } from "@/data/hotel-curated";

/** 全 ASP リンクの末尾に付与する共通 UTM */
function utmCampaignFor(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `weekly_digest_${y}${m}${d}`;
}

export function appendUtm(url: string, campaign: string): string {
  if (!url) return url;
  // tp.media のように既に長いクエリを持つ URL も多いので、URL クラスで安全に追加
  try {
    const u = new URL(url);
    if (!u.searchParams.has("utm_source")) {
      u.searchParams.set("utm_source", "newsletter");
    }
    if (!u.searchParams.has("utm_medium")) {
      u.searchParams.set("utm_medium", "email");
    }
    if (!u.searchParams.has("utm_campaign")) {
      u.searchParams.set("utm_campaign", campaign);
    }
    return u.toString();
  } catch {
    // URL parse 失敗時は安全側 (元の URL のまま) を返す
    return url;
  }
}

function yen(n: number): string {
  return new Intl.NumberFormat("ja-JP").format(n);
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** discount% 降順で TOP N 件 (同一 origin→destination は最安を 1 件のみ) */
function pickTopDeals(deals: DealSchema[], n: number): DealSchema[] {
  const byRoute = new Map<string, DealSchema>();
  for (const d of deals) {
    const key = `${d.origin_code}-${d.destination_code}`;
    const prev = byRoute.get(key);
    if (!prev || (d.discount_percent ?? 0) > (prev.discount_percent ?? 0)) {
      byRoute.set(key, d);
    }
  }
  return [...byRoute.values()]
    .sort((a, b) => (b.discount_percent ?? 0) - (a.discount_percent ?? 0))
    .slice(0, n);
}

/** 直近 N 日に published されたユニーク記事 (最大 limit 件) */
function pickRecentArticles(
  articles: Article[],
  days: number,
  limit: number
): Article[] {
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  return articles
    .filter((a) => {
      const t = Date.parse(a.published_at);
      return Number.isFinite(t) && t >= since;
    })
    .slice(0, limit);
}

/** ラグジュアリー帯の curated ホテルを 3 都市から 1 件ずつピックアップ */
function pickEditorialHotels(n: number): Array<{
  hotel: CuratedHotel;
  citySlug: string;
  cityNameJa: string;
  cityNameEn: string;
}> {
  const out: Array<{
    hotel: CuratedHotel;
    citySlug: string;
    cityNameJa: string;
    cityNameEn: string;
  }> = [];
  // ローテーション基準 (週単位) で都市を変える → メール退屈さの軽減
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const slugs = Object.keys(CURATED_HOTELS);
  if (slugs.length === 0) return out;

  for (let i = 0; i < slugs.length && out.length < n; i++) {
    const slug = slugs[(week + i) % slugs.length];
    const list = CURATED_HOTELS[slug] ?? [];
    const luxury =
      list.find((h) => h.tier === "ラグジュアリー") ??
      list.find((h) => h.tier === "ハイクラス") ??
      list[0];
    if (!luxury) continue;
    const dest = HOTEL_BY_SLUG[slug];
    out.push({
      hotel: luxury,
      citySlug: slug,
      cityNameJa: dest?.nameJa ?? slug,
      cityNameEn: dest?.nameEn ?? slug,
    });
  }
  return out;
}

const MONTH_NAMES = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

type AirlinePrediction = {
  code: string;
  name: string;
  avgDiscount: number;
  peakMonths: number[];
  avgInterval: number | null;
  totalSales: number;
};

/**
 * セール実績のある航空会社を週替わりでローテーションし、n 社の「セール傾向」を返す。
 * 当サイトの看板コンテンツ (航空会社セール予測) をメールに載せ、勝ちページ
 * (/airlines/{code}/sales) へ送客する。全て過去実績ベースで景表法上も安全。
 */
function pickAirlinePredictions(n: number): AirlinePrediction[] {
  const withStats = airlines
    .map((a) => ({ a, stats: getAirlineSaleStats(a.code) }))
    .filter((x): x is { a: (typeof airlines)[number]; stats: NonNullable<ReturnType<typeof getAirlineSaleStats>> } => x.stats !== null);
  if (withStats.length === 0) return [];
  const week = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const out: AirlinePrediction[] = [];
  for (let i = 0; i < withStats.length && out.length < n; i++) {
    const { a, stats } = withStats[(week + i) % withStats.length];
    out.push({
      code: a.code,
      name: a.name,
      avgDiscount: stats.avgDiscount,
      peakMonths: stats.peakMonths,
      avgInterval: stats.avgInterval,
      totalSales: stats.totalSales,
    });
  }
  return out;
}

function airlinePredictionRowHtml(p: AirlinePrediction, campaign: string): string {
  const url = appendUtm(`${SITE}/airlines/${p.code}/sales`, campaign);
  const peak =
    p.peakMonths.length > 0
      ? p.peakMonths.map((m) => MONTH_NAMES[m]).join("・")
      : "不定期";
  const interval = p.avgInterval ? `約${p.avgInterval}日間隔` : "不定期";
  return `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f4f4f5">
        <a href="${esc(url)}" style="font-size:14px;color:#18181b;font-weight:bold;text-decoration:none">
          ${esc(p.name)}のセール予測 &rarr;
        </a>
        <p style="font-size:12px;color:#71717a;margin:4px 0 0;line-height:1.6">
          過去${p.totalSales}回開催・平均<span style="color:#e11d48;font-weight:bold">${p.avgDiscount}%OFF</span>／${esc(interval)}<br>
          セールが多い時期: <span style="color:#3f3f46;font-weight:bold">${esc(peak)}</span>
        </p>
      </td>
    </tr>`;
}

function dealRowHtml(d: DealSchema, campaign: string): string {
  const url = appendUtm(d.affiliate_url ?? `${SITE}/deals/${d.id}`, campaign);
  const discount = d.discount_percent ?? 0;
  return `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #f1f1f4">
        <table role="presentation" style="width:100%;border-collapse:collapse">
          <tr>
            <td style="vertical-align:top">
              <p style="font-size:12px;color:#71717a;margin:0 0 4px">${esc(d.airline_name)}</p>
              <p style="font-size:16px;color:#18181b;font-weight:bold;margin:0 0 6px">
                ${esc(d.origin)} &rarr; ${esc(d.destination)}
              </p>
              <p style="font-size:13px;color:#3f3f46;margin:0">
                <span style="color:#18181b;font-weight:bold">&yen;${yen(d.sale_price)}</span>
                <span style="color:#e11d48;font-weight:bold;margin-left:6px">-${discount}%</span>
              </p>
            </td>
            <td style="vertical-align:top;text-align:right;white-space:nowrap;padding-left:12px">
              <a href="${esc(url)}" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;font-size:13px;font-weight:bold;padding:9px 16px;border-radius:8px">
                予約する
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function articleRowHtml(a: Article, campaign: string): string {
  const url = appendUtm(`${SITE}/articles/${a.slug}`, campaign);
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f4f4f5">
        <p style="font-size:11px;color:#a1a1aa;margin:0 0 4px">${esc(a.category)}</p>
        <a href="${esc(url)}" style="font-size:14px;color:#18181b;font-weight:bold;text-decoration:none;line-height:1.5;display:block;margin-bottom:4px">
          ${esc(a.title)}
        </a>
        <p style="font-size:12px;color:#71717a;margin:0;line-height:1.5">${esc(a.excerpt)}</p>
      </td>
    </tr>`;
}

function hotelRowHtml(
  entry: { hotel: CuratedHotel; citySlug: string; cityNameJa: string },
  campaign: string
): string {
  const h = entry.hotel;
  const url = appendUtm(`${SITE}/hotels/${entry.citySlug}`, campaign);
  const score = h.reviewScore ? ` ★${h.reviewScore}` : "";
  return `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f4f4f5">
        <p style="font-size:11px;color:#a1a1aa;margin:0 0 3px">${esc(entry.cityNameJa)} / ${esc(h.area)}</p>
        <a href="${esc(url)}" style="font-size:14px;color:#18181b;font-weight:bold;text-decoration:none">
          ${esc(h.name)}${esc(score)}
        </a>
        <p style="font-size:12px;color:#71717a;margin:4px 0 0;line-height:1.5">${esc(h.highlight)}</p>
      </td>
    </tr>`;
}

export type DigestPayload = {
  subject: string;
  html: (recipientEmail: string) => string;
  text: string;
  /** 件数情報 (admin preview / ログ用) */
  meta: {
    deals: number;
    articles: number;
    hotels: number;
    airlines: number;
    campaign: string;
  };
};

/**
 * 週次 digest の subject / html / text を生成する。
 *
 * html は recipient ごとに配信解除リンクを差し替えるため関数で返す。
 * Resend の batch send で per-recipient HTML として渡せる。
 */
export async function generateWeeklyDigest(
  now: Date = new Date()
): Promise<DigestPayload> {
  const campaign = utmCampaignFor(now);

  // データ収集 (片方のソースが落ちても残りで配信できるように try/catch)
  let allDeals: DealSchema[] = [];
  try {
    allDeals = await getActiveDeals();
  } catch (e) {
    console.error("[digest] getActiveDeals failed:", e);
  }
  let allArticles: Article[] = [];
  try {
    allArticles = await getAllArticles();
  } catch (e) {
    console.error("[digest] getAllArticles failed:", e);
  }

  const topDeals = pickTopDeals(allDeals, 5);
  const recentArticles = pickRecentArticles(allArticles, 7, 4);
  const hotels = pickEditorialHotels(3);
  const predictions = pickAirlinePredictions(3);

  const dateLabel = `${now.getUTCFullYear()}/${now.getUTCMonth() + 1}/${now.getUTCDate()}`;

  const subject =
    topDeals.length > 0
      ? `【BEATRIP 週次ダイジェスト】今週の TOP ${topDeals.length} お得航空券 (${dateLabel})`
      : `【BEATRIP 週次ダイジェスト】編集部おすすめ (${dateLabel})`;

  const dealsSection =
    topDeals.length > 0
      ? `
        <h2 style="font-size:16px;color:#18181b;margin:32px 0 8px;letter-spacing:.02em">
          今週の TOP ${topDeals.length} ディール
        </h2>
        <p style="font-size:13px;color:#71717a;margin:0 0 8px">割引率順。最安値のタイミングを逃さずチェック。</p>
        <table role="presentation" style="width:100%;border-collapse:collapse">
          ${topDeals.map((d) => dealRowHtml(d, campaign)).join("")}
        </table>`
      : "";

  const predictionsSection =
    predictions.length > 0
      ? `
        <h2 style="font-size:16px;color:#18181b;margin:32px 0 8px;letter-spacing:.02em">
          航空会社セール予測
        </h2>
        <p style="font-size:13px;color:#71717a;margin:0 0 8px">過去のセール実績から次の狙い目を予測。開催前に準備を。</p>
        <table role="presentation" style="width:100%;border-collapse:collapse">
          ${predictions.map((p) => airlinePredictionRowHtml(p, campaign)).join("")}
        </table>`
      : "";

  const articlesSection =
    recentArticles.length > 0
      ? `
        <h2 style="font-size:16px;color:#18181b;margin:32px 0 8px;letter-spacing:.02em">
          今週の新着記事
        </h2>
        <table role="presentation" style="width:100%;border-collapse:collapse">
          ${recentArticles.map((a) => articleRowHtml(a, campaign)).join("")}
        </table>`
      : "";

  const hotelsSection =
    hotels.length > 0
      ? `
        <h2 style="font-size:16px;color:#18181b;margin:32px 0 8px;letter-spacing:.02em">
          編集部おすすめホテル
        </h2>
        <table role="presentation" style="width:100%;border-collapse:collapse">
          ${hotels.map((h) => hotelRowHtml(h, campaign)).join("")}
        </table>`
      : "";

  const html = (recipientEmail: string): string => {
    const unsub = unsubscribeUrl(recipientEmail);
    const siteUrl = appendUtm(SITE, campaign);
    return `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#fafafa">
  <table role="presentation" style="width:100%;background:#fafafa;border-collapse:collapse">
    <tr><td align="center" style="padding:24px 12px">
      <table role="presentation" style="max-width:600px;width:100%;background:#fff;border-radius:12px;border-collapse:collapse">
        <tr><td style="padding:32px 28px 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b">
          <h1 style="font-size:20px;letter-spacing:.05em;margin:0 0 4px">BEATRIP</h1>
          <p style="font-size:13px;color:#71717a;margin:0 0 16px">週次ダイジェスト · ${esc(dateLabel)}</p>
          <p style="font-size:14px;color:#3f3f46;line-height:1.7;margin:0">
            最新のセール・記事・おすすめホテルをまとめてお届けします。気になるものはタップして詳細をご覧ください。
          </p>
          ${dealsSection}
          ${predictionsSection}
          ${articlesSection}
          ${hotelsSection}
          <div style="text-align:center;margin:32px 0 8px">
            <a href="${esc(siteUrl)}" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 28px;border-radius:10px">
              BEATRIP を開く
            </a>
          </div>
        </td></tr>
        <tr><td style="padding:20px 28px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;border-top:1px solid #f4f4f5">
          <p style="font-size:11px;color:#a1a1aa;line-height:1.6;margin:0 0 6px">
            掲載価格は取得時点のものです。最新価格・空席は各予約サイトでご確認ください。
            予約手数料は提携先により異なります。当サイトのリンクは一部 affiliate を含みます。
          </p>
          <p style="font-size:11px;color:#a1a1aa;line-height:1.6;margin:0">
            &copy; ${now.getUTCFullYear()} BEATRIP · このメールの配信を停止する場合は
            <a href="${esc(unsub)}" style="color:#a1a1aa;text-decoration:underline">こちら</a>。
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  };

  // プレーンテキスト版 (一部 MTA で text/plain が好まれる)
  const textLines: string[] = [
    `BEATRIP 週次ダイジェスト (${dateLabel})`,
    "",
    "最新のセール・記事・おすすめホテルをまとめてお届けします。",
    "",
  ];
  if (topDeals.length > 0) {
    textLines.push(`# 今週の TOP ${topDeals.length} ディール`);
    for (const d of topDeals) {
      textLines.push(
        `- [${d.airline_name}] ${d.origin} -> ${d.destination}  ¥${yen(d.sale_price)} (-${d.discount_percent ?? 0}%)`
      );
    }
    textLines.push("");
  }
  if (predictions.length > 0) {
    textLines.push("# 航空会社セール予測");
    for (const p of predictions) {
      const peak =
        p.peakMonths.length > 0
          ? p.peakMonths.map((m) => MONTH_NAMES[m]).join("・")
          : "不定期";
      textLines.push(
        `- ${p.name}: 平均${p.avgDiscount}%OFF / セールが多い時期 ${peak}  ${SITE}/airlines/${p.code}/sales`
      );
    }
    textLines.push("");
  }
  if (recentArticles.length > 0) {
    textLines.push("# 今週の新着記事");
    for (const a of recentArticles) {
      textLines.push(`- ${a.title}`);
    }
    textLines.push("");
  }
  if (hotels.length > 0) {
    textLines.push("# 編集部おすすめホテル");
    for (const h of hotels) {
      textLines.push(`- ${h.cityNameJa} / ${h.hotel.area}: ${h.hotel.name}`);
    }
    textLines.push("");
  }
  textLines.push(`${SITE}`);
  textLines.push("");
  textLines.push("配信停止: メール内の配信停止リンクからお手続きください。");
  const text = textLines.join("\n");

  return {
    subject,
    html,
    text,
    meta: {
      deals: topDeals.length,
      articles: recentArticles.length,
      hotels: hotels.length,
      airlines: predictions.length,
      campaign,
    },
  };
}
