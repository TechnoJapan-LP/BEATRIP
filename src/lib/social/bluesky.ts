import { AtpAgent, RichText } from "@atproto/api";
import type { AirlineSale } from "@/lib/scrapers/types";
import type { HotDeal } from "@/lib/deals/hot-deals";
import { cityNameJa } from "@/lib/airport-names";
import {
  filterPostable,
  pickBestRoute,
  daysUntilDeadline,
  deadlineLabel,
} from "./postable";

/**
 * Bluesky 自動投稿クライアント
 *
 * env:
 *   BLUESKY_HANDLE        例 "beatrip.bsky.social"
 *   BLUESKY_APP_PASSWORD  app passwords 画面で発行する専用パスワード
 *
 * 両方未設定なら no-op（dev/未契約でリンク切れを起こさない）。
 */

const SERVICE = "https://bsky.social";

function getCreds(): { handle: string; password: string } | null {
  const handle = process.env.BLUESKY_HANDLE;
  const password = process.env.BLUESKY_APP_PASSWORD;
  if (!handle || !password) return null;
  return { handle, password };
}

/**
 * Bluesky の session トークンは 7 日程度で expire するため、
 * モジュールスコープで永続キャッシュすると古い session で失敗し続ける。
 * 起動から 6 時間で再 login を強制するシンプルな TTL を実装。
 */
const AGENT_TTL_MS = 6 * 60 * 60 * 1000;
let cachedAgent: AtpAgent | null = null;
let cachedAt = 0;

async function getAgent(): Promise<AtpAgent | null> {
  if (cachedAgent && Date.now() - cachedAt < AGENT_TTL_MS) return cachedAgent;
  const creds = getCreds();
  if (!creds) return null;
  const agent = new AtpAgent({ service: SERVICE });
  try {
    await agent.login({
      identifier: creds.handle,
      password: creds.password,
    });
  } catch (e) {
    console.error("[bluesky] login failed", e);
    cachedAgent = null;
    return null;
  }
  cachedAgent = agent;
  cachedAt = Date.now();
  return agent;
}

/** 1セールを1ポストに整形（300字以内・URL/ハッシュタグはリッチに認識される） */
export function buildPostText(sale: AirlineSale): string | null {
  const r = pickBestRoute(sale);
  if (!r) return null;
  const yen = new Intl.NumberFormat("ja-JP").format(r.price);
  const route = `${cityNameJa(r.originCode)}→${cityNameJa(r.destinationCode)}`;
  const url = `https://beatrip.jp/routes/${r.originCode}-${r.destinationCode}`;
  const days = daysUntilDeadline(sale);
  const label = deadlineLabel(sale);

  // X と同じ訴求ロジック (1行目でスクロールを止める)。Bluesky は300字上限。
  const d = r.discount ?? 0;
  const hook =
    d >= 70
      ? `🚨 ${d}%OFF！ 見逃し厳禁のセール`
      : d >= 50
        ? `🔥 半額以下！ ${d}%OFF セール開催中`
        : days !== null && days <= 3
          ? `⚡ まもなく締切！ 限定セール`
          : d >= 30
            ? `✈️ ${d}%OFF セール開催中`
            : days !== null && days <= 7
              ? `⏰ 今週まで！ 期間限定セール`
              : `✈️ セール開催中`;

  const discount = d ? ` (通常比 -${d}%)` : "";
  const deadline =
    days !== null && label
      ? days <= 0
        ? "\n⏳ 本日締切"
        : days <= 7
          ? `\n⏳ ${label} まで（あと${days}日）`
          : `\n📅 ${label} まで`
      : "";
  const airline = sale.airlineName.slice(0, 20);

  return `${hook}\n${route} ¥${yen}〜${discount}\n${airline}${deadline}\n${url}\n#格安航空券 #BEATRIP`;
}

/**
 * 新着セールを Bluesky に投稿する。
 * - クレデンシャル未設定なら何もしない（戻り値 [])
 * - 1セール1ポスト、レート保護のため1.5秒間隔
 * - 連投を防ぐため、呼び出し側で dedup 済みのセールだけ渡すこと
 */
export async function postSalesToBluesky(
  sales: AirlineSale[],
  maxPosts = 5
): Promise<string[]> {
  const agent = await getAgent();
  if (!agent) return [];

  // 品質ゲート: 着地時にサイトへ掲載され続けるセールだけ投稿する
  const postable = filterPostable(sales);

  const posted: string[] = [];
  for (const sale of postable.slice(0, maxPosts)) {
    const text = buildPostText(sale);
    if (!text) continue;
    try {
      const rt = new RichText({ text });
      await rt.detectFacets(agent);
      await agent.post({
        text: rt.text,
        facets: rt.facets,
        createdAt: new Date().toISOString(),
      });
      posted.push(sale.id);
    } catch (e) {
      console.error("[bluesky] post failed:", sale.id, e);
    }
    // 軽いスロットル
    await new Promise((r) => setTimeout(r, 1500));
  }
  return posted;
}

/** 新規検出の超お買い得 (価格急落) を Bluesky に速報する。dedup は呼び出し側。 */
export async function postHotDealsToBluesky(
  hotDeals: HotDeal[],
  maxPosts = 3
): Promise<string[]> {
  const agent = await getAgent();
  if (!agent) return [];

  const posted: string[] = [];
  for (const h of hotDeals.slice(0, maxPosts)) {
    const yen = new Intl.NumberFormat("ja-JP").format(h.price);
    const prevYen = new Intl.NumberFormat("ja-JP").format(h.previous_price);
    const route = `${cityNameJa(h.origin_code)}→${cityNameJa(h.destination_code)}`;
    const cabin = h.cabin === "Business" ? " ビジネスクラス" : "";
    const url = `https://beatrip.jp/routes/${h.origin_code}-${h.destination_code}`;
    const text = `⚡超お買い得を検出\n${route}${cabin} ¥${yen}\n直前の観測 ¥${prevYen} から -${h.drop_percent}%\n${url}\n#格安航空券 #BEATRIP`;
    try {
      const rt = new RichText({ text });
      await rt.detectFacets(agent);
      await agent.post({
        text: rt.text,
        facets: rt.facets,
        createdAt: new Date().toISOString(),
      });
      posted.push(h.id);
    } catch (e) {
      console.error("[bluesky] hot deal post failed:", h.id, e);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return posted;
}
