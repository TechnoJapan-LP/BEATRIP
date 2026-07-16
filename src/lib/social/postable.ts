import type { AirlineSale, SaleRoute } from "@/lib/scrapers/types";

/**
 * SNS 投稿の品質ゲート
 *
 * 「投稿を見てリンクを踏んだのに、リンク先にセールが無い」を防ぐ。
 * 原因は投稿時に掲載条件を確認していなかったこと:
 *   - サイト側 (getActiveDeals) は isActive かつ bookingDeadline >= now の
 *     セールしか表示しない
 *   - 一方 SNS 投稿は newSales をそのまま流していた
 * → 締切が近い/切れているセールを投稿すると、着地時には既に消えている。
 *
 * ここで「投稿してよいセール」を一元的に判定する。X / Bluesky の両方から使う。
 */

/** 投稿から着地までのラグを見込んだ最低残り時間 (これ未満は投稿しない) */
const MIN_HOURS_LEFT = 12;

/** サイトに掲載され続ける (= リンク先で見られる) セールか */
export function isPostable(sale: AirlineSale): boolean {
  if (!sale.isActive) return false;
  if (pickBestRoute(sale) === null) return false;

  const deadline = new Date(sale.bookingDeadline).getTime();
  if (!Number.isFinite(deadline)) return false;

  // 締切まで MIN_HOURS_LEFT 未満なら投稿しない。
  // (投稿直後に getActiveDeals から消えて「セールがありません」になるため)
  const hoursLeft = (deadline - Date.now()) / (1000 * 60 * 60);
  return hoursLeft >= MIN_HOURS_LEFT;
}

/** 投稿対象を絞り込む (呼び出し側の dedup と併用) */
export function filterPostable(sales: AirlineSale[]): AirlineSale[] {
  return sales.filter(isPostable);
}

/**
 * 投稿に使う代表ルート = 最安。
 * 価格が無い/不正なルートしかなければ null (= 投稿対象外)。
 */
export function pickBestRoute(sale: AirlineSale): SaleRoute | null {
  const valid = sale.routes.filter(
    (r) => Number.isFinite(r.price) && r.price > 0 && r.originCode && r.destinationCode
  );
  if (valid.length === 0) return null;
  return [...valid].sort((a, b) => a.price - b.price)[0];
}

/** 締切までの残り日数 (投稿文の緊急性表現に使う)。不明なら null。 */
export function daysUntilDeadline(sale: AirlineSale): number | null {
  const deadline = new Date(sale.bookingDeadline).getTime();
  if (!Number.isFinite(deadline)) return null;
  const days = Math.ceil((deadline - Date.now()) / (1000 * 60 * 60 * 24));
  return days >= 0 ? days : null;
}

/** 締切の表示用ラベル (例: "7/20")。不明なら null。 */
export function deadlineLabel(sale: AirlineSale): string | null {
  const d = new Date(sale.bookingDeadline);
  if (!Number.isFinite(d.getTime())) return null;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
