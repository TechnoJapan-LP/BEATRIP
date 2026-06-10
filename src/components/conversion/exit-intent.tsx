import { getActiveDeals } from "@/lib/deals/deal-service";
import {
  ExitIntentModal,
  type ExitIntentDeal,
} from "@/components/conversion/exit-intent-modal";

/**
 * ExitIntent — exit-intent / scroll-depth モーダルのサーバー側ラッパー。
 *
 * 人気ディール TOP3 をサーバーで取得して client モーダルに渡す。
 * deal 取得に失敗しても (空配列) モーダルはメルマガ訴求のみで成立する。
 *
 * layout に直接置くことで全ページに常駐するが、client 側で
 * 7 日 dismiss / トリガー条件を満たすまで描画しない (DOM も出さない) ため
 * 初期ペイントへの影響は最小。
 */
export async function ExitIntent() {
  let deals: ExitIntentDeal[] = [];
  try {
    const active = await getActiveDeals();
    deals = active
      // 割引率の高い順を「人気」の代理指標とする
      .slice()
      .sort((a, b) => b.discount_percent - a.discount_percent)
      .slice(0, 3)
      .map((d) => ({
        id: d.id,
        destination: d.destination,
        price: d.sale_price,
        discountPercent: d.discount_percent,
        route: `${d.origin_code} → ${d.destination_code}`,
      }));
  } catch {
    deals = [];
  }

  return <ExitIntentModal deals={deals} />;
}
