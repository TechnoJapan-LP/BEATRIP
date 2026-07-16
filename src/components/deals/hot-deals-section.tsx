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

export async function HotDealsSection() {
  const all = await loadHotDeals();
  if (all.length === 0) return null;

  const active = all
    .filter((h) => h.status === "active")
    .sort((a, b) => b.drop_percent - a.drop_percent)
    .slice(0, 6);
  const gone = all
    .filter((h) => h.status === "gone")
    .sort((a, b) => new Date(b.gone_at ?? 0).getTime() - new Date(a.gone_at ?? 0).getTime())
    .slice(0, 3);

  if (active.length === 0 && gone.length === 0) return null;

  return (
    <section aria-labelledby="hot-deals-title" className="mb-10">
      <div className="mb-1 flex items-center gap-2">
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
      </div>
      <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
        毎日の価格ウォッチで「直前の観測から急落した運賃」を自動検出。消える前にチェック。
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {active.map((h) => (
          <ActiveCard key={h.id} h={h} />
        ))}
        {gone.map((h) => (
          <GoneCard key={h.id} h={h} />
        ))}
      </div>
    </section>
  );
}
