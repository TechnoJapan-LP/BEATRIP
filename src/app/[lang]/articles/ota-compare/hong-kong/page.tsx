/**
 * /articles/ota-compare/hong-kong
 * 「香港のホテル予約 Booking vs Agoda vs Trip.com vs Hotellook 徹底比較」
 *
 * 都市別チューニング:
 *  - アジア圏のため Agoda の在庫・価格競争力が際立つ都市。
 *  - 中環・尖沙咀の高層ホテルが中心。Trip.com (本拠アジア) の在庫網も厚い。
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
  return buildOtaCompareMetadata("hong-kong", lang);
}

const PROFILE: CityOtaProfile = {
  lede: "香港は中環・尖沙咀を中心に高層シティホテルが密集するアジアの旅行ハブ。アジア圏に強い Agoda の在庫・価格競争力が際立ち、Trip.com もアジア本拠の強みで在庫網が厚い都市です。Booking.com は無料キャンセル可プランの選びやすさで安定。コンパクトに観光できるぶん人気エリアの宿は埋まりやすいため、Hotellook で各社の総額を見比べて早めに確保するのが効率的です。",
  overrides: {
    agoda: {
      inventoryTilt: "high",
      priceTilt: "high",
      cityNote: "アジア圏の本領発揮。中環・尖沙咀の高層ホテルで底値が出やすい",
    },
    trip: {
      inventoryTilt: "high",
      priceTilt: "high",
      cityNote: "アジア本拠の強みで在庫が厚く、香港 (HKG) 便とのバンドル割引も効く",
    },
    booking: {
      inventoryTilt: "high",
      priceTilt: "mid",
      cityNote: "尖沙咀・中環の在庫が厚く、無料キャンセル可プランを見つけやすい",
    },
  },
  segments: {
    budget:
      "コスパ重視なら Agoda の Secret Deals と Trip.com を Hotellook で横断比較。アジア圏は両社の底値が出やすく、夜景重視の尖沙咀でも候補が見つかります。",
    premium:
      "ハーバービューの高層ラグジュアリー系は Booking.com が無料キャンセル比率で安心。予定変更の可能性があるなら柔軟プラン優先が結局得です。",
    instant:
      "香港 (HKG) 着のフライトと同時に予約するなら Trip.com のバンドル割引が分かりやすく、アジア在庫の厚さと相性が良好です。",
  },
};

export default async function Page({ params }: Props) {
  const { lang } = await params;
  return <OtaCompareCityPage slug="hong-kong" lang={lang} profile={PROFILE} />;
}
