/**
 * 都市単位の「1泊スターティング価格」を返すアダプタ層
 *
 * Hotellook データ API は 2025/10 に閉鎖済みのため直接は使えない。
 * 現在は以下の戦略で動的な「実データ感のある」価格を出す：
 *
 *  - HOTEL_PRICE_SOURCE=booking_cache + TP_BOOKING_FEED_URL 設定
 *      → TravelPayouts Booking cache feed (JSON) から都市別最安値を取得 + KV キャッシュ
 *      （Booking の TP プログラム承認後にのみ有効）
 *  - 上記が未設定 / 失敗時
 *      → priceFromJpy（編集者ベースライン）を「シーズン補正係数」で動的に揺らす
 *        繁忙期/閑散期の差を反映し、ユーザーの「今行ったらいくら」直感に近い数値に
 *
 * Server Components から `await getCityStartingPrice(slug, baseline)` で呼ぶ。
 * フォールバックは完全 deterministic（同じ slug + 同じ日 → 同じ価格）。
 */

import { getHotelDestinationBySlug } from "@/data/hotel-destinations";

const PRICE_SOURCE = process.env.HOTEL_PRICE_SOURCE ?? "season_adjusted";
const BOOKING_FEED_URL = process.env.TP_BOOKING_FEED_URL;
const FEED_REVALIDATE_SECONDS = 60 * 60 * 6; // 6時間

export type CityStartingPrice = {
  /** 1泊あたりの最安円価格（推定 or 実データ） */
  jpy: number;
  /** "live"=Booking feed 由来 / "estimate"=シーズン補正推定 */
  source: "live" | "estimate";
  /** UI に「目安」と添えるべきか */
  isEstimate: boolean;
};

/** 月別繁忙期係数（JST ベース） — 旅行需要の経験則 */
const MONTH_FACTOR: Record<number, number> = {
  1: 1.1,   // 正月直後は少し閑散だが寒地は需要あり
  2: 0.95,  // 閑散期
  3: 1.15,  // 春休み・卒業旅行
  4: 1.2,   // 桜・GW直前
  5: 1.35,  // GW
  6: 0.95,  // 梅雨
  7: 1.15,  // 夏休み開始
  8: 1.4,   // お盆
  9: 1.0,   // シルバーウィーク影響軽微
  10: 1.05, // 秋行楽
  11: 1.0,
  12: 1.45, // 年末年始
};

/** 都市タイプ別の補正（リゾート系は夏冬の振れ幅が大きい） */
const CITY_TYPE_FACTOR: Record<string, { summer?: number; winter?: number }> = {
  // 沖縄・南国 → 夏ピーク強め
  okinawa: { summer: 1.15, winter: 0.95 },
  bangkok: { summer: 0.95, winter: 1.1 },
  bali: { summer: 0.9, winter: 1.15 },
  honolulu: { summer: 1.1, winter: 1.1 },
  // 北海道・冬リゾート → 冬ピーク
  sapporo: { winter: 1.15, summer: 1.0 },
  // 欧州都市 → 夏が観光ピーク
  paris: { summer: 1.15, winter: 0.9 },
  london: { summer: 1.15, winter: 0.9 },
  rome: { summer: 1.2, winter: 0.85 },
  barcelona: { summer: 1.2, winter: 0.85 },
};

/**
 * 与えられた baseline 価格に「現在の月」のシーズン補正を掛けて返す。
 * baseline=undefined のときは null を返す（呼び出し側でフォールバック表示）。
 *
 * 注意: Server Component 内で new Date() が走る = ビルド時 ISR が再生成されるたびに
 * 月別係数が反映される。`/hotels/[city]` 全体に revalidate 設定が無くてもページ
 * リクエストごとに再計算（ただし next/cache がページキャッシュするので実質は ISR 周期）。
 */
function applySeasonAdjustment(slug: string, baseline: number): number {
  const month = new Date().getMonth() + 1;
  const monthFactor = MONTH_FACTOR[month] ?? 1.0;
  const cityFactor = CITY_TYPE_FACTOR[slug] ?? {};

  let f = monthFactor;
  if ((month === 7 || month === 8) && cityFactor.summer != null) {
    f *= cityFactor.summer;
  } else if ((month === 12 || month === 1 || month === 2) && cityFactor.winter != null) {
    f *= cityFactor.winter;
  }

  // 100円単位で丸め
  return Math.round((baseline * f) / 100) * 100;
}

type BookingFeedEntry = {
  city_slug?: string;
  city_iata?: string;
  min_price_jpy?: number;
};

/**
 * Booking cache feed から都市別最安値を取得（承認後のみ）。
 * 取得失敗時は null（呼び出し側がフォールバックに切り替える）。
 *
 * フィードのスキーマは TravelPayouts ダッシュボードで Booking 承認後に
 * ダウンロード可能になる JSON を想定。実 URL は ENV `TP_BOOKING_FEED_URL` に
 * 投入する。期待形式:
 *   [{ "city_slug": "tokyo", "city_iata": "TYO", "min_price_jpy": 9800 }, ...]
 */
async function fetchBookingFeedPrice(slug: string): Promise<number | null> {
  if (!BOOKING_FEED_URL) return null;
  try {
    const res = await fetch(BOOKING_FEED_URL, {
      next: { revalidate: FEED_REVALIDATE_SECONDS, tags: ["hotel-price-feed"] },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as BookingFeedEntry[];
    const entry = data.find(
      (e) =>
        e.city_slug?.toLowerCase() === slug.toLowerCase() ||
        e.city_iata?.toLowerCase() === slug.toLowerCase()
    );
    return entry?.min_price_jpy ?? null;
  } catch {
    return null;
  }
}

/**
 * 都市の1泊スターティング価格を返す。
 * 呼び出し例:
 *   const price = await getCityStartingPrice("tokyo");
 *   // → { jpy: 9200, source: "estimate", isEstimate: true }
 */
export async function getCityStartingPrice(
  slug: string
): Promise<CityStartingPrice | null> {
  const dest = getHotelDestinationBySlug(slug);
  const baseline = dest?.priceFromJpy;

  // 1) live feed を試す（承認後）
  if (PRICE_SOURCE === "booking_cache" && BOOKING_FEED_URL) {
    const live = await fetchBookingFeedPrice(slug);
    if (live != null) {
      return { jpy: live, source: "live", isEstimate: false };
    }
  }

  // 2) フォールバック: シーズン補正
  if (baseline == null) return null;
  const adjusted = applySeasonAdjustment(slug, baseline);
  return { jpy: adjusted, source: "estimate", isEstimate: true };
}

/**
 * 今後1〜3ヶ月の価格動向シグナル。
 * 現在月の係数と将来月の係数を比較し、「上昇中」「下降中」「横ばい」を返す。
 * FOMO 演出（今が安い／今すぐ予約推奨）に使う。
 */
export type PriceTrend = {
  /** 'rising' = 今後上昇 / 'falling' = 今後下降 / 'stable' = 横ばい */
  direction: "rising" | "falling" | "stable";
  /** 現在月 → 1〜3ヶ月先のピーク月の変化率 (%) */
  changePercent: number;
  /** UI 表示用の短文 */
  label: string;
  /** ユーザー向け推奨アクション */
  recommendation: string;
  /** 比較対象の「将来ピーク月」 (1-12) */
  peakMonth: number;
};

export function getCityPriceTrend(slug: string): PriceTrend {
  const now = new Date().getMonth() + 1;
  const cityFactor = CITY_TYPE_FACTOR[slug] ?? {};

  const factorFor = (month: number) => {
    const m = ((month - 1) % 12) + 1;
    let f = MONTH_FACTOR[m] ?? 1.0;
    if ((m === 7 || m === 8) && cityFactor.summer != null) f *= cityFactor.summer;
    else if ((m === 12 || m === 1 || m === 2) && cityFactor.winter != null) f *= cityFactor.winter;
    return f;
  };

  const current = factorFor(now);
  let peakMonth = now;
  let peakFactor = current;
  for (let i = 1; i <= 3; i++) {
    const m = ((now - 1 + i) % 12) + 1;
    const f = factorFor(m);
    if (f > peakFactor) {
      peakFactor = f;
      peakMonth = m;
    }
  }

  const changePercent = Math.round(((peakFactor - current) / current) * 100);

  if (changePercent >= 15) {
    return {
      direction: "rising",
      changePercent,
      peakMonth,
      label: `${peakMonth}月にかけて約${changePercent}%上昇見込み`,
      recommendation: "今のうちに予約を確保するのがおすすめ",
    };
  }

  // 下降検出: 1-3 ヶ月先の最低 vs 現在
  let troughFactor = current;
  let troughMonth = now;
  for (let i = 1; i <= 3; i++) {
    const m = ((now - 1 + i) % 12) + 1;
    const f = factorFor(m);
    if (f < troughFactor) {
      troughFactor = f;
      troughMonth = m;
    }
  }
  const troughChange = Math.round(((troughFactor - current) / current) * 100);

  if (troughChange <= -10) {
    return {
      direction: "falling",
      changePercent: troughChange,
      peakMonth: troughMonth,
      label: `${troughMonth}月にかけて約${Math.abs(troughChange)}%下落見込み`,
      recommendation: "急ぎでなければ少し待つと安く取れる可能性",
    };
  }

  return {
    direction: "stable",
    changePercent: 0,
    peakMonth: now,
    label: "価格は当面安定",
    recommendation: "需要が増える前のタイミングで予約推奨",
  };
}
