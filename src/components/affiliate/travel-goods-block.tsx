// Server Component:
// 記事内の物販 (旅行用品) アフィリエイトブロック。
//
// japanese-partners-panel.tsx と同じ設計思想:
//  - サーバーで env (AFFILIATE_URL_GOODS_*) を読み、設定済み商品だけ描画
//  - クリック計測の onClick が必要な <a> のみ小さな client wrapper に切り出す
//    (TrackedTravelGoodLink) ことで、env をクライアントに漏らさず bundle も最小化
//
// env 未設定 (= まだ商品リンク未取得) の場合は該当商品が出ず、
// 全商品が未設定なら null を返してブロックごと非表示になる (regression ゼロ)。

import { ShoppingBag } from "lucide-react";
import {
  getTravelGoodsForArticle,
  getTravelGoodUrl,
} from "@/data/travel-goods";
import { PrNotice } from "@/components/compliance/pr-notice";
import { TrackedTravelGoodLink } from "@/components/affiliate/tracked-travel-good-link";

/**
 * 物販 (旅行用品) ブロック。
 *
 * @param articleSlug 設置先ガイド記事の slug。recommendedFor で商品をフィルタする。
 * @param title       ブロック見出し (省略時は既定文言)。
 * @param source      GA4 計測用の起点ページ識別子 (省略可)。
 */
export function TravelGoodsBlock({
  articleSlug,
  title = "旅の前に揃えたい旅行グッズ",
  source,
}: {
  articleSlug: string;
  title?: string;
  source?: string;
}) {
  const goods = getTravelGoodsForArticle(articleSlug);

  // env 設定済み商品が 1 件もなければブロックごと非表示
  if (goods.length === 0) return null;

  return (
    <aside className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <header className="border-b border-zinc-100 dark:border-zinc-800 px-5 py-3">
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-zinc-900 dark:text-zinc-100">
          <ShoppingBag className="h-4 w-4 text-zinc-400" aria-hidden="true" />
          {title}
          <PrNotice variant="badge" />
        </h3>
        <p className="text-[11px] text-zinc-500 mt-0.5">
          Amazon・楽天などで購入できる旅行用品をピックアップ
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5">
        {goods.map((good) => {
          const href = getTravelGoodUrl(good);
          if (!href) return null;
          return (
            <div
              key={good.id}
              className="flex flex-col justify-between rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 p-4"
            >
              <div>
                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {good.label}
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {good.tagline}
                </p>
              </div>
              <div className="mt-3">
                <TrackedTravelGoodLink
                  href={href}
                  goodId={good.id}
                  category={good.category}
                  source={source}
                  accent={good.accent}
                  label="Amazon・楽天で見る"
                />
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
