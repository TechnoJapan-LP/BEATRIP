import { Award } from "lucide-react";

/**
 * 「BEATRIP 編集部おすすめ」吹き出し (Pack D)
 *
 * curated hotel カード内、tier 上位帯 (ラグジュアリー / ハイクラス) で
 * highlight 文を強調表示するための小型 callout。
 * 「なぜこのホテルを編集部が推すか」を一行で伝え、判断疲れを下げる。
 *
 * Server Component (state なし)。
 */

type Tier = "ラグジュアリー" | "ハイクラス" | "ミドル" | "バジェット";

const TIER_STYLE: Record<
  Tier,
  { wrap: string; iconWrap: string; iconColor: string; label: string }
> = {
  ラグジュアリー: {
    wrap: "bg-amber-50 ring-amber-200 text-amber-900 dark:bg-amber-900/20 dark:ring-amber-800 dark:text-amber-100",
    iconWrap: "bg-amber-100 dark:bg-amber-900/60",
    iconColor: "text-amber-600 dark:text-amber-300",
    label: "text-amber-700 dark:text-amber-300",
  },
  ハイクラス: {
    wrap: "bg-sky-50 ring-sky-200 text-sky-900 dark:bg-sky-900/20 dark:ring-sky-800 dark:text-sky-100",
    iconWrap: "bg-sky-100 dark:bg-sky-900/60",
    iconColor: "text-sky-600 dark:text-sky-300",
    label: "text-sky-700 dark:text-sky-300",
  },
  ミドル: {
    wrap: "bg-sky-50 ring-sky-200 text-sky-900 dark:bg-sky-900/20 dark:ring-sky-800 dark:text-sky-100",
    iconWrap: "bg-sky-100 dark:bg-sky-900/60",
    iconColor: "text-sky-600 dark:text-sky-300",
    label: "text-sky-700 dark:text-sky-300",
  },
  バジェット: {
    wrap: "bg-sky-50 ring-sky-200 text-sky-900 dark:bg-sky-900/20 dark:ring-sky-800 dark:text-sky-100",
    iconWrap: "bg-sky-100 dark:bg-sky-900/60",
    iconColor: "text-sky-600 dark:text-sky-300",
    label: "text-sky-700 dark:text-sky-300",
  },
};

export function EditorPickCallout({
  reason,
  tier,
  className = "",
}: {
  reason: string;
  tier: Tier;
  className?: string;
}) {
  const style = TIER_STYLE[tier];

  return (
    <div
      className={`flex items-start gap-2 rounded-lg px-2.5 py-2 ring-1 ${style.wrap} ${className}`}
    >
      <span
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${style.iconWrap}`}
        aria-hidden="true"
      >
        <Award className={`h-3.5 w-3.5 ${style.iconColor}`} />
      </span>
      <div className="min-w-0 flex-1">
        <div
          className={`text-[10px] font-bold uppercase tracking-wider ${style.label}`}
        >
          BEATRIP 編集部おすすめ
        </div>
        <p className="mt-0.5 text-xs leading-relaxed">{reason}</p>
      </div>
    </div>
  );
}
