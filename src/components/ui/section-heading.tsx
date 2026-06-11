import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * セクション見出し (Server Component)。
 *
 * font-heading (Bebas Neue) はラテン文字専用のため、日本語見出しに付けると
 * フォールバック sans + uppercase + tracking-wide が無意味に当たって
 * 英語見出しと見た目が乖離する (UI 監査指摘)。
 * テキストの主体スクリプトを判定して適切なスタイルを出し分ける:
 * - ラテン主体: font-heading + uppercase + tracking-wide (現行スタイル維持)
 * - 日本語主体: font-bold + tracking-tight (自然な日本語見出し)
 */

const JAPANESE_PATTERN = /[ぁ-んァ-ン一-龯]/;

const SIZE_CLASSES = {
  lg: "text-3xl sm:text-4xl lg:text-5xl",
  md: "text-2xl sm:text-3xl lg:text-4xl",
  sm: "text-xl sm:text-2xl",
} as const;

type SectionHeadingProps = {
  children: ReactNode;
  /** 見出しレベル (デフォルト h2) */
  as?: "h1" | "h2" | "h3";
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
  /** 見出し直下に出す補足テキスト */
  subtitle?: ReactNode;
};

/** ReactNode からプレーンテキストを抽出 (スクリプト判定用) */
function toPlainText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(toPlainText).join("");
  }
  if (node && typeof node === "object" && "props" in node) {
    return toPlainText(
      (node as { props: { children?: ReactNode } }).props.children,
    );
  }
  return "";
}

export function SectionHeading({
  children,
  as: Tag = "h2",
  size = "md",
  className,
  subtitle,
}: SectionHeadingProps) {
  const isJapanese = JAPANESE_PATTERN.test(toPlainText(children));

  const heading = (
    <Tag
      className={cn(
        "text-zinc-900 dark:text-zinc-100",
        SIZE_CLASSES[size],
        isJapanese
          ? "font-bold tracking-tight"
          : "font-heading tracking-wide uppercase",
        className,
      )}
    >
      {children}
    </Tag>
  );

  if (subtitle == null) {
    return heading;
  }

  return (
    <div>
      {heading}
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {subtitle}
      </p>
    </div>
  );
}
