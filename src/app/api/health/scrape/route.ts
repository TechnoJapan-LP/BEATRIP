import { NextResponse } from "next/server";
import { isKVEnabled } from "@/lib/store/kv";
import { loadAllSales } from "@/lib/store/sale-store";
import { getMilesFreshness } from "@/lib/miles/data";
import { loadHotDeals } from "@/lib/deals/hot-deals";
import { getObservationStats } from "@/lib/deals/price-observations";
import { getSaleRecordStats } from "@/lib/deals/sale-records";
import { loadPostOutcome } from "@/lib/social/posted-store";
import { listAlerts } from "@/lib/price-alerts/store";
import { listSubscribers } from "@/lib/newsletter/store";
import {
  loadSubscriptions,
  loadAlerts,
} from "@/lib/notifications/subscriptions";

/**
 * スクレイパー稼働の公開ヘルスチェック (機密情報は出さない)。
 *
 * 返すもの:
 *   scraperMode      "mock" | "live" | "hybrid"  (本番稼働には "hybrid" 推奨)
 *   kvEnabled        KV(Upstash/Vercel KV) が接続されているか (永続化に必須)
 *   storeSalesCount  ストアに載っているセール総数 (同梱seed含む)
 *   latestScrapedAt  最も新しい取得日時 (鮮度。最近なら cron が動いている)
 *
 * 判定の目安:
 *   - scraperMode==="hybrid" かつ kvEnabled===true なら A の設定は正しい
 *   - latestScrapedAt が直近24-48hなら cron も正常稼働
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  let storeSalesCount = 0;
  let latestScrapedAt: string | null = null;

  try {
    const all = await loadAllSales();
    for (const data of Object.values(all)) {
      const sales = Array.isArray(
        (data as { sales?: unknown[] })?.sales
      )
        ? (data as { sales: unknown[] }).sales
        : [];
      storeSalesCount += sales.length;
      const ts =
        (data as { lastScraped?: string; timestamp?: string })?.lastScraped ??
        (data as { timestamp?: string })?.timestamp ??
        null;
      if (ts && (!latestScrapedAt || ts > latestScrapedAt)) {
        latestScrapedAt = ts;
      }
    }
  } catch {
    // ストア読み込み失敗時も health は 200 で返す (状態が分かることが目的)
  }

  const scraperMode = process.env.SCRAPER_MODE ?? "mock";
  const kvEnabled = isKVEnabled();
  const ready = scraperMode === "hybrid" && kvEnabled;

  // スクレイプ鮮度の番犬。トリガーは2系統 (Vercel 日次 cron + GitHub Actions 3h
  // おき) で、どちらか生きていれば latestScrapedAt は更新される。両方が静かに
  // 死ぬと蓄積が止まるが、内部からは気づけないため、この stale フラグを
  // 独立した watchdog ワークフローが外から監視する (.github/workflows/
  // scrape-watchdog.yml)。閾値は日次の底 (24h) + Vercel/GH の発火遅延を見込んで
  // 28h。これ未満の欠落は 3h 冗長化と日次 dedup が吸収するので鳴らさない。
  const STALE_THRESHOLD_MIN = 28 * 60;
  let scrapeFreshness: {
    ageMinutes: number | null;
    stale: boolean;
    warning: string | null;
  } = { ageMinutes: null, stale: !ready, warning: null };
  if (ready) {
    if (!latestScrapedAt) {
      scrapeFreshness = {
        ageMinutes: null,
        stale: true,
        warning: "スクレイプ実績が1件もありません。cron が一度も成功していない可能性があります。",
      };
    } else {
      const ageMin = Math.floor((Date.now() - Date.parse(latestScrapedAt)) / 60000);
      const stale = ageMin > STALE_THRESHOLD_MIN;
      scrapeFreshness = {
        ageMinutes: ageMin,
        stale,
        warning: stale
          ? `最終スクレイプから ${Math.floor(ageMin / 60)} 時間経過。Vercel cron と GitHub Actions の両方が止まっている可能性があります (CRON_SECRET・エンドポイント・スケジュールを確認)。`
          : null,
      };
    }
  }

  // SNS 自動投稿の設定状況 (値は出さず boolean のみ)。新着セール発生時に投稿される。
  const xConfigured = Boolean(
    process.env.X_API_KEY &&
      process.env.X_API_SECRET &&
      process.env.X_ACCESS_TOKEN &&
      process.env.X_ACCESS_SECRET
  );
  const blueskyConfigured = Boolean(
    process.env.BLUESKY_HANDLE && process.env.BLUESKY_APP_PASSWORD
  );

  // 計測タグの設定状況 (値は出さず boolean + 長さのみ)。
  // NEXT_PUBLIC_ 変数はビルド時に焼き込まれるため、この true/false で
  // 「env が Vercel に届いているか」を切り分けられる。
  const clarityRaw = process.env.NEXT_PUBLIC_CLARITY_ID ?? "";
  const gaRaw = process.env.NEXT_PUBLIC_GA_ID ?? "";
  const analytics = {
    clarityConfigured: clarityRaw.trim().length > 0,
    clarityIdLength: clarityRaw.trim().length,
    gaConfigured: gaRaw.trim().length > 0,
  };

  // アフィリエイト: program ID が env に届いているか (値は出さず boolean のみ)。
  // 未設定だと buildPartnerUrl が tp.media wrap せず素のリンクを返す = 報酬ゼロ。
  const affiliate = {
    airalo: Boolean(process.env.TP_AIRALO_PROGRAM_ID?.trim()),
    gigsky: Boolean(process.env.TP_GIGSKY_PROGRAM_ID?.trim()),
    yesim: Boolean(process.env.TP_YESIM_PROGRAM_ID?.trim()),
    kiwitaxi: Boolean(process.env.TP_KIWITAXI_PROGRAM_ID?.trim()),
    insurance: Boolean(process.env.TP_INSURANCE_PROGRAM_ID?.trim()),
    localrent: Boolean(process.env.TP_LOCALRENT_PROGRAM_ID?.trim()),
    getrentacar: Boolean(process.env.TP_GETRENTACAR_PROGRAM_ID?.trim()),
    klook: Boolean(process.env.TP_KLOOK_PROGRAM_ID?.trim()),
    kkday: Boolean(process.env.TP_KKDAY_PROGRAM_ID?.trim()),
    airhelp: Boolean(process.env.TP_AIRHELP_PROGRAM_ID?.trim()),
    booking: Boolean(process.env.TP_BOOKING_PROGRAM_ID?.trim()),
    agoda: Boolean(process.env.TP_AGODA_PROGRAM_ID?.trim()),
    tripHotel: Boolean(process.env.TP_TRIP_HOTEL_PROGRAM_ID?.trim()),
    // Trip.com 直接提携 (Allianceid)。主CTA を日本語+JPY にできるかの判定に使う
    tripComFlights: Boolean(process.env.TRIP_COM_AFFILIATE_ID?.trim()),
    // SID = Trip.com 管理画面の Site ID (数値)。Allianceid だけ合っていても
    // SID が未設定/誤りだと管理画面のクリックが 0 のままになる (実際に起きた:
    // SID に "BEATRIP" という文字列を入れていて計上されていなかった)。
    tripComSiteId: Boolean(process.env.TRIP_COM_SITE_ID?.trim()),
    // 主CTA が Skyscanner だった頃の名残。未設定なら Skyscanner リンクは無報酬
    skyscanner: Boolean(process.env.SKYSCANNER_ASSOCIATE_ID?.trim()),
  };

  // 超お買い得 (価格急落) の稼働状況
  // TravelPayouts 価格データAPI のトークン有無。これが無いと価格ウォッチが
  // 空になり、超お買い得の検出も実測運賃の蓄積も永久にゼロのままになる
  // (どちらも watched = TP の観測結果を入力にしているため)。値は出さない。
  const travelpayouts = {
    apiTokenConfigured: !!process.env.TRAVELPAYOUTS_API_TOKEN,
    markerConfigured: !!process.env.TRAVELPAYOUTS_MARKER,
  };

  // 実測運賃の蓄積状況。routesReadyForReal が増えるほど「推計」表示が実測に変わる。
  let priceObservations = { routes: 0, points: 0, routesReadyForReal: 0 };
  try {
    priceObservations = await getObservationStats();
  } catch {
    // KV 未設定・未蓄積時は既定値のまま
  }

  // 実セール実績の蓄積状況。airlinesReadyForReal が増えるほど参考データが実測に変わる。
  let saleRecords = { total: 0, airlines: 0, airlinesReadyForReal: 0 };
  try {
    saleRecords = await getSaleRecordStats();
  } catch {
    // KV 未設定・未蓄積時は既定値のまま
  }

  let hotDeals = { active: 0, gone: 0 };
  try {
    const list = await loadHotDeals();
    hotDeals = {
      active: list.filter((h) => h.status === "active").length,
      gone: list.filter((h) => h.status === "gone").length,
    };
  } catch {
    // health は常に 200 を返す
  }

  // マイルデータ (公式転記) の鮮度。燃油サーチャージは2ヶ月ごとに改定され、
  // 失効すると画面から金額が消える (嘘をつかないための挙動) が、放置に
  // 気づけないため health から監視できるようにする。
  const today = new Date().toISOString().slice(0, 10);
  let milesData: ReturnType<typeof getMilesFreshness> | { error: string };
  try {
    milesData = getMilesFreshness(today);
  } catch (e) {
    milesData = { error: e instanceof Error ? e.message : String(e) };
  }

  // 直近の SNS 投稿結果。xConfigured は env の有無しか見ておらず、
  // 「認証は通るが残高ゼロで 402」のような状態を検知できない。
  // succeeded が 0 のまま続くなら、サイトの「Xに即速報します」という
  // 説明が実態と食い違っている状態なので要対応。
  const lastPost = {
    x: await loadPostOutcome("x").catch(() => null),
    bluesky: await loadPostOutcome("bluesky").catch(() => null),
  };

  // 「利用者が残していった資産」の蓄積量。**件数だけを出す** —
  // メールアドレスや購読エンドポイントは公開エンドポイントに絶対に載せない。
  //
  // なぜ要るか:
  //  - 価格アラートは登録されても、これまで外から件数を見る手段が無かった。
  //    0件なのか、登録があるのに配信が壊れているのかを区別できず「静かな失敗」
  //    になる (KPI スナップショットで実際に踏んだ) 。
  //  - この3つは買い手が最も見る「継続利用の証拠」でもある。日次で控えれば
  //    月次 KPI の間を埋める推移になる。
  const engagement = await (async () => {
    const [alerts, subscribers, pushSubs, pushAlerts] = await Promise.all([
      listAlerts().catch(() => null),
      listSubscribers().catch(() => null),
      loadSubscriptions().catch(() => null),
      loadAlerts().catch(() => null),
    ]);
    return {
      priceAlerts: alerts?.length ?? null,
      newsletterSubscribers: subscribers?.length ?? null,
      pushSubscriptions: pushSubs?.length ?? null,
      // Web Push の購読はあるが配信側 (/api/alerts/dispatch) を呼ぶ経路が
      // 無い。0 でない場合、登録した人に一度も届いていないことを意味する。
      pushAlertsRegistered: pushAlerts?.length ?? null,
      note: "件数のみ。個人情報は出さない",
    };
  })();

  return NextResponse.json({
    ready,
    scraperMode,
    kvEnabled,
    storeSalesCount,
    latestScrapedAt,
    scrapeFreshness,
    social: { xConfigured, blueskyConfigured, lastPost },
    analytics,
    affiliate,
    hotDeals,
    travelpayouts,
    priceObservations,
    saleRecords,
    milesData,
    engagement,
    hint: ready
      ? "A 設定OK。latestScrapedAt が直近なら cron も稼働中。"
      : "本番稼働には SCRAPER_MODE=hybrid と KV 接続 (kvEnabled=true) が必要。",
  });
}
