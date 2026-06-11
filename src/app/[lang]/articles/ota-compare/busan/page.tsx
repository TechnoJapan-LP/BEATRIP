/**
 * /articles/ota-compare/busan
 * 「釜山のホテル予約 Booking vs Agoda vs Trip.com vs Hotellook 徹底比較」
 *
 * 都市別チューニング:
 *  - 韓国・アジア圏のため Agoda の在庫・価格競争力が際立つ都市。
 *  - 海雲台のリゾートと西面のビジネス系で最適サイトが変わる点に注意。
 */

import type { Metadata } from "next";
import {
  buildOtaCompareMetadata,
  OtaCompareCityPage,
  type CityOtaProfile,
} from "@/lib/articles/ota-compare-template";

type Props = { params: Promise<{ lang: string }> };

export const revalidate = 86400;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return buildOtaCompareMetadata("busan", lang);
}

const PROFILE: CityOtaProfile = {
  lede: "釜山は海雲台のビーチリゾートから西面の繁華街、南浦洞のチャガルチ市場まで宿のタイプが幅広い韓国第 2 の都市。アジア圏に強い Agoda の在庫・価格競争力が際立ち、Trip.com もアジア在庫の厚さが魅力です。Booking.com は無料キャンセル可プランの選びやすさで安定。夏の海水浴シーズンは海雲台周辺が埋まりやすいため、Hotellook で各社の総額を見比べて早めに確保するのが効率的です。",
  overrides: {
    agoda: {
      inventoryTilt: "high",
      priceTilt: "high",
      cityNote: "韓国・アジア圏の本領発揮。西面・南浦洞のホテルで底値が出やすい",
    },
    trip: {
      inventoryTilt: "high",
      priceTilt: "mid",
      cityNote: "アジア在庫が厚く、釜山 (PUS) 便とのバンドル割引も効きやすい",
    },
    booking: {
      inventoryTilt: "high",
      priceTilt: "mid",
      cityNote: "海雲台のリゾート系まで在庫が厚く、無料キャンセル可プランを探しやすい",
    },
  },
  segments: {
    budget:
      "西面・南浦洞のビジネスホテルやゲストハウスを狙うなら Agoda の Secret Deals。Hotellook で Trip.com と横断比較すると底値を取りこぼしにくいです。",
    premium:
      "海雲台のオーシャンビューリゾートやラグジュアリー系は Booking.com が無料キャンセル比率で安心。夏の繁忙期は早期確保が結局得です。",
    instant:
      "釜山 (PUS) 着のフライトと同時に予約するなら Trip.com のバンドル割引が分かりやすく、アジア在庫の厚さと相性が良好です。",
  },
};

export default async function Page({ params }: Props) {
  const { lang } = await params;
  return <OtaCompareCityPage slug="busan" lang={lang} profile={PROFILE} />;
}
