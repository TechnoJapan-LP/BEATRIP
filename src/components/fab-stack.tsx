"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * 右下フローティングボタン (FAB) を 1 本の縦列にまとめる共有コンテナ。
 *
 * これまでは各 FAB が自前で `fixed bottom-[...]` を持ち、globals.css の
 * --fab-1 / --fab-2 / --fab-3 という「段」を静的に割り当てていた。
 * この方式には 2 つの欠陥があった:
 *
 *   1. 段の取り合いが起きる。通知パネルだけがトークンを使わず
 *      `bottom: 72px` 直書き + PC は `sm:bottom-6` だったため、履歴 FAB
 *      (--fab-1 = 68px / PC は 24px) とほぼ完全に重なっていた。
 *      PC では座標が完全一致し、z-50 の通知が履歴を覆って押せなかった。
 *   2. FAB はどれも条件付き描画 (履歴/比較は 0 件なら null、チャットは
 *      env で無効、通知は TOP のみ) なので、静的な段割りだと欠けた段が
 *      そのまま空白になり、ボタンが宙に浮く。
 *
 * そこで「段番号」をやめ、実際に描画された FAB だけを flex で下から
 * 詰める。各 FAB は自分の中身だけを描き、位置はこのコンテナが決める。
 * 並び順は DOM の挿入順 (dynamic import の解決順で不定) ではなく
 * CSS の order で決めるため、読み込みタイミングに関わらず一定になる。
 *
 * ドロワー/モーダル本体はここに入れない。コンテナは z-30 で stacking
 * context を作るため、z-50 のオーバーレイを内側に入れるとヘッダー等の
 * 下に潜ってしまう。移すのは起動ボタンだけ。
 */

const STACK_ID = "fab-stack";

/* コンテナは React 外で生成するので、Tailwind がクラスを検出できるよう
   文字列リテラルとしてここに置く (ソース走査の対象になる)。 */
const STACK_CLASS =
  "fixed right-3 bottom-[var(--fab-base)] z-30 flex flex-col-reverse items-end gap-3 pointer-events-none sm:right-6";

/** 下から上への並び順。数字が小さいほど下 (親指に近い)。 */
export const FAB_ORDER = {
  /** 履歴: 全ページ常設で最も出現頻度が高い */
  recentlyViewed: 1,
  /** 通知設定: TOP のみ */
  notifications: 2,
  /** 比較: 比較リストに入れたときだけ */
  comparison: 3,
  /** AI チャット: env で有効化したときだけ */
  chat: 4,
} as const;

function ensureStack(): HTMLElement {
  const existing = document.getElementById(STACK_ID);
  if (existing) return existing;
  const el = document.createElement("div");
  el.id = STACK_ID;
  el.className = STACK_CLASS;
  document.body.appendChild(el);
  return el;
}

/**
 * 子要素を右下の FAB 列に差し込む。中身は position 指定を持たない
 * 通常フローの要素として書く (fixed / bottom / right / z は不要)。
 */
export function FabSlot({
  order,
  children,
}: {
  order: number;
  children: ReactNode;
}) {
  // コンテナは body 直下に後付けするため、マウント後にしか掴めない。
  // FAB 自体がいずれも hydration 後にしか出ない (ssr: false / localStorage
  // 依存) ので、1 フレーム遅れることによる見た目の差は無い。
  const [stack, setStack] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setStack(ensureStack());
  }, []);

  if (!stack) return null;

  return createPortal(
    <div style={{ order }} className="pointer-events-auto">
      {children}
    </div>,
    stack
  );
}
