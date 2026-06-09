/**
 * /articles/ota-compare/osaka
 * 「大阪のホテル予約 Booking vs Agoda vs Trip.com vs Hotellook 徹底比較」
 *
 * 都市別チューニング:
 *  - USJ・道頓堀・関空アクセスの 3 軸で需要が立つため、エリア別の価格差が大きい。
 *  - インバウンド需要の戻りで Agoda の最安提示が目立つ都市の一つ。
 */

import type { Metadata } from "next";
import {
  buildOtaCompareMetadata,
  OtaCompareCityPage,
  type CityOtaProfile,
} from "@/lib/articles/ota-compare-template";

type Props = { params: Promise<{ lang: string }> };

export const revalidate = 21600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return buildOtaCompareMetadata("osaka", lang);
}

const PROFILE: CityOtaProfile = {
  lede: "大阪はインバウンド需要の戻りでホテル価格の変動が大きい都市。Agoda が最安帯を更新することが多い一方、USJ 近郊・心斎橋などピンポイント立地は Booking.com の方が在庫を持っていることが多い。航空券 (関空着) とのバンドルなら Trip.com、最安横断は Hotellook、と用途で使い分けると失敗が少ない構成です。",
  overrides: {
    booking: {
      inventoryTilt: "high",
      priceTilt: "mid",
      cityNote:
        "梅田・難波・心斎橋など主要駅近の独立系/外資チェーン在庫が手厚い",
    },
    agoda: {
      inventoryTilt: "high",
      priceTilt: "high",
      cityNote:
        "インバウンド需要の戻りでアジア系ホテル含めて最安帯を更新しやすい",
    },
    trip: {
      inventoryTilt: "mid",
      priceTilt: "mid",
      cityNote:
        "KIX 着の国際線と同時予約するとバンドル割引が比較的明確に効く",
    },
    hotellook: {
      inventoryTilt: "high",
      priceTilt: "high",
      cityNote:
        "価格差が大きい都市ほどメタサーチの有効性が高い — まず横断比較推奨",
    },
  },
  segments: {
    budget:
      "難波/心斎橋のビジネスホテルや USJ 近郊のチェーン系は Agoda の Secret Deals が刺さりやすい。Hotellook で楽天トラベル含めた価格を並べて最終決定するのが効率的。",
    premium:
      "ザ・リッツ・カールトン大阪、セントレジス大阪、コンラッド大阪等のハイクラスは Booking.com が無料キャンセルプラン込みで強い。直前変更可で保険を効かせたい用途に最適。",
    instant:
      "関空着の LCC・FSC と同時予約なら Trip.com のバンドル割引。Trip Coins と会員ランクの継続還元で 2 回目以降の旅行コストが下がりやすい。",
  },
};

export default async function Page({ params }: Props) {
  const { lang } = await params;
  return <OtaCompareCityPage slug="osaka" lang={lang} profile={PROFILE} />;
}
