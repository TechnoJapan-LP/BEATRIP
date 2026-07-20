import Link from "next/link";
import { Zap, TrendingDown, Clock, ExternalLink } from "lucide-react";
import { loadHotDeals, type HotDeal } from "@/lib/deals/hot-deals";

/**
 * 超お買い得 (価格急落) セクション — /deals 上部
 *
 * TP 価格ウォッチの前回比急落を「消える前に確認する掘り出し物」として提示。
 * 消滅したものは削除せず「売り切れ」として一定期間見せる (FOMO → 速報登録導線)。
 *
 * 景表法配慮: 「検出した観測価格」という事実ベースの表現。予約可能性は保証
 * しないため、CTA は「予約サイトで確認」とする。
 */

/** "2026-09-05" → "9/5"。観測便の日付表示用 */
function fmtDay(iso: string): string {
  const m = iso.match(/^\d{4}-(\d{2})-(\d{2})/);
  if (!m) return iso;
  return `${Number(m[1])}/${Number(m[2])}`;
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(ms / (60 * 60 * 1000));
  if (hours < 1) return "1時間以内";
  if (hours < 24) return `${hours}時間前`;
  return `${Math.floor(hours / 24)}日前`;
}

function survivedLabel(h: HotDeal): string {
  if (!h.gone_at) return "";
  const ms = new Date(h.gone_at).getTime() - new Date(h.detected_at).getTime();
  const hours = Math.max(1, Math.round(ms / (60 * 60 * 1000)));
  return hours < 24 ? `約${hours}時間で消滅` : `約${Math.round(hours / 24)}日で消滅`;
}

function yen(n: number): string {
  return new Intl.NumberFormat("ja-JP").format(n);
}

function ActiveCard({ h }: { h: HotDeal }) {
  return (
    <a
      href={h.booking_url}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className="group relative flex flex-col gap-2 rounded-xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-orange-50 p-4 transition-transform hover:-translate-y-0.5 dark:border-rose-800 dark:from-rose-950/40 dark:to-orange-950/30"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white">
          <Zap className="h-3 w-3" />
          {h.cabin === "Business" ? "ビジネスが急落" : "価格急落"}
        </span>
        <span className="text-[10px] text-zinc-400">{timeAgo(h.detected_at)}に検出</span>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {h.origin} → {h.destination}
          {h.cabin === "Business" && (
            <span className="ml-1.5 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
              ビジネス
            </span>
          )}
        </p>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
          <span className="font-heading text-2xl tracking-wide text-rose-600 dark:text-rose-400">
            ¥{yen(h.price)}
          </span>
          <span className="text-xs text-zinc-400 line-through">¥{yen(h.previous_price)}</span>
          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
            <TrendingDown className="h-3 w-3" />-{h.drop_percent}%
          </span>
        </div>
        {h.depart_date && (
          <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-white/70 px-2 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300">
            {fmtDay(h.depart_date)}発
            {h.return_date ? ` — ${fmtDay(h.return_date)}帰着` : ""} の便で観測
          </p>
        )}
        <p className="mt-0.5 text-[10px] text-zinc-400">
          直前の観測価格からの下落。実際の価格・空席は予約サイトでご確認ください
        </p>
      </div>
      <span className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold text-white transition-colors group-hover:bg-rose-600 dark:bg-zinc-100 dark:text-zinc-900 dark:group-hover:bg-rose-400">
        予約サイトで確認
        <ExternalLink className="h-3 w-3" />
      </span>
    </a>
  );
}

function GoneCard({ h }: { h: HotDeal }) {
  return (
    <div className="relative flex flex-col gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4 opacity-80 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-400 px-2 py-0.5 text-[10px] font-bold text-white dark:bg-zinc-600">
          売り切れ
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400">
          <Clock className="h-3 w-3" />
          {survivedLabel(h)}
        </span>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-zinc-500 dark:text-zinc-400">
          {h.origin} → {h.destination}
          {h.cabin === "Business" && <span className="ml-1.5 text-[10px]">(ビジネス)</span>}
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-heading text-xl tracking-wide text-zinc-400 line-through">
            ¥{yen(h.price)}
          </span>
          <span className="text-xs font-bold text-zinc-400">-{h.drop_percent}%だった</span>
        </div>
        <p className="mt-0.5 text-[10px] text-zinc-400">
          この価格は消滅しました。次の急落を見逃さないには速報をフォロー
        </p>
      </div>
    </div>
  );
}

export async function HotDealsSection({
  /**
   * "deals": /deals 埋め込み用。データ0件なら何も出さず、見出しに /hot-deals への
   *          リンクを付ける (default)。
   * "page":  /hot-deals 専用ページ用。見出しはページ側が持ち、0件でも
   *          「現在監視中」の空状態を出す (SEO ページを空にしない)。
   */
  variant = "deals",
}: {
  variant?: "deals" | "page";
} = {}) {
  const all = await loadHotDeals();

  // 表示は「新しい順」かつ「検出から2日以内」に限る。
  //
  // 以前は下落率の高い順に並べていたが、急落は鮮度が命で、数日前の検出は
  // 既に値が戻っている/売り切れていることが多く、割引率が高いというだけで
  // 上に居座り続けてしまう。掲載順とカードの「◯日前に検出」も噛み合わない。
  //
  // store 側の STALE_ACTIVE_MS も 48h だが判定軸が違う (あちらは last_seen_at
  // = 観測できなくなってからの経過)。ここは detected_at = 検出からの経過で
  // 絞る。データは消さず表示から外すだけなので、実績としては残る。
  const FRESH_WINDOW_MS = 48 * 60 * 60 * 1000;
  const now = Date.now();
  const isFresh = (iso: string) => {
    const t = new Date(iso).getTime();
    // 日付が壊れているものは弾かない (握りつぶすと原因が見えなくなる)
    return Number.isNaN(t) || now - t <= FRESH_WINDOW_MS;
  };
  const byNewest = (a: HotDeal, b: HotDeal) =>
    new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime();

  // 下落率の下限。store 側の DROP_THRESHOLD (0.30) と同じ基準を表示にも敷く。
  // 引き上げ前 (25%) に検出済みのものが KV に残っており、それらは新基準を
  // 満たさないまま TTL まで表示され続けてしまうため、ここでも弾く。
  // store 側を変えるときはこの値も合わせること (現状ここだけ二重管理)。
  const MIN_DROP_PERCENT = 30;
  const isBigEnough = (h: HotDeal) => h.drop_percent >= MIN_DROP_PERCENT;

  const active = all
    .filter((h) => h.status === "active" && isFresh(h.detected_at) && isBigEnough(h))
    .sort(byNewest)
    .slice(0, variant === "page" ? 12 : 6);
  // 売り切れカードも active と同じ軸で揃える。セクション全体を
  // 「検出から2日以内のものを、検出の新しい順に」という1つのルールで
  // 説明できる状態にする (以前は active=下落率順・gone=売り切れ時刻順で
  // 軸が2つあり、並びの根拠が読み手に伝わらなかった)。
  //
  // ストア側の GONE_TTL_MS は 72時間のままにしてある。ここは表示の絞り込み
  // だけで、検出の実績はデータとして残す。
  const gone = all
    .filter((h) => h.status === "gone" && isFresh(h.detected_at) && isBigEnough(h))
    .sort(byNewest)
    .slice(0, variant === "page" ? 9 : 3);

  if (variant === "deals" && active.length === 0 && gone.length === 0) return null;

  const grid =
    active.length === 0 && gone.length === 0 ? (
      <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <Zap className="mx-auto mb-2 h-6 w-6 text-zinc-300 dark:text-zinc-600" />
        <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300">
          現在、価格の急落は検出されていません
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          6時間ごとに監視中。検出すると X と Bluesky に即速報し、このページに掲載されます。
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {active.map((h) => (
          <ActiveCard key={h.id} h={h} />
        ))}
        {gone.map((h) => (
          <GoneCard key={h.id} h={h} />
        ))}
      </div>
    );

  if (variant === "page") return grid;

  return (
    <section aria-labelledby="hot-deals-title" className="mb-10">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <Zap className="h-5 w-5 text-rose-500" />
        <h2
          id="hot-deals-title"
          className="font-heading text-xl tracking-wide text-zinc-900 uppercase dark:text-zinc-100 sm:text-2xl"
        >
          超お買い得
        </h2>
        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-900/40 dark:text-rose-300">
          BETA
        </span>
        <Link
          href="/hot-deals"
          className="ml-auto text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          エラーフェアとは？仕組みと履歴 →
        </Link>
      </div>
      <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
        毎日の価格ウォッチで「直前の観測から急落した運賃」を自動検出。消える前にチェック。
      </p>
      {grid}
    </section>
  );
}
