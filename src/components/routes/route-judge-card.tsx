import { TrendingDown, TrendingUp, Minus, ArrowDown } from "lucide-react";
import { formatPrice } from "@/lib/format";
import type { PriceJudgement } from "@/lib/deals/price-judge";

/**
 * 「今買うか待つか」ジャッジカード — 路線ページのファーストビュー用
 *
 * 比較サイト離脱の最大理由「もっと安くなるかも」という迷いに、
 * 実測観測のパーセンタイルで説明可能な裁定を出す。
 * 観測不足の路線では judgement が null になり、カードごと出ない
 * (薄いデータで裁定を出すと嘘になるため。判定条件は price-judge.ts)。
 *
 * CTA は同一ページ内の予約パネル (#route-booking) へのアンカー。
 * アフィリエイトリンクの生成と計測は既存の予約パネル1箇所に集約したままにする。
 */

const VERDICT = {
  cheap: {
    label: "いまは安い",
    Icon: TrendingDown,
    badge: "bg-emerald-600 text-white",
    ring: "border-emerald-200 dark:border-emerald-900/60",
    bg: "bg-emerald-50/60 dark:bg-emerald-950/30",
    note: "過去90日の観測の中では下位圏です。この水準は長く続かないことがあります",
  },
  normal: {
    label: "ふつうの水準",
    Icon: Minus,
    badge: "bg-zinc-600 text-white dark:bg-zinc-500",
    ring: "border-zinc-200 dark:border-zinc-700",
    bg: "bg-white dark:bg-zinc-900",
    note: "過去90日の観測レンジの中間圏。セール待ちも選択肢です",
  },
  high: {
    label: "いまは高め",
    Icon: TrendingUp,
    badge: "bg-rose-600 text-white",
    ring: "border-rose-200 dark:border-rose-900/60",
    bg: "bg-rose-50/40 dark:bg-rose-950/20",
    note: "過去90日の観測の中では上位圏。急ぎでなければセール通知を待つ手も",
  },
} as const;

function fmtDate(iso: string): string {
  const m = iso.match(/^\d{4}-(\d{2})-(\d{2})/);
  return m ? `${Number(m[1])}/${Number(m[2])}` : iso;
}

export function RouteJudgeCard({
  judgement,
  originJa,
  destJa,
}: {
  judgement: PriceJudgement;
  originJa: string;
  destJa: string;
}) {
  const v = VERDICT[judgement.verdict];
  return (
    <section
      aria-label="いま買うか待つかの目安"
      className={`mb-8 rounded-xl border p-4 sm:p-5 ${v.ring} ${v.bg}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${v.badge}`}
        >
          <v.Icon className="h-3.5 w-3.5" aria-hidden="true" />
          {v.label}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {originJa}→{destJa}・BEATRIP実測にもとづく目安
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-heading text-3xl tracking-wide text-zinc-900 dark:text-zinc-100">
          ¥{formatPrice(judgement.latestPrice)}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {fmtDate(judgement.latestDate)}の観測値
        </span>
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
          過去{judgement.windowDays}日の観測{judgement.sampleDays}日中、安い方から
          {judgement.percentile}%の位置
        </span>
      </div>

      <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
        {v.note}。観測レンジ: ¥{formatPrice(judgement.min)}〜¥
        {formatPrice(judgement.max)}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href="#route-booking"
          className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          予約サイトで空席と日付を確認
          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>

      <p className="mt-3 border-t border-zinc-200/60 pt-2 text-[10px] leading-relaxed text-zinc-400 dark:border-zinc-700/60">
        BEATRIPが実際に観測した最安値の分布に対する位置づけです。将来の価格や
        空席を保証するものではありません。実測が不足している路線には表示されません。
      </p>
    </section>
  );
}
