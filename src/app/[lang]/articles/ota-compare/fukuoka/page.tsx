/**
 * /articles/ota-compare/fukuoka
 * 「福岡のホテル予約 Booking vs Agoda vs Trip.com vs Hotellook 徹底比較」
 *
 * 都市別チューニング:
 *  - 博多・天神の駅近ビジネスホテルが中心。空港アクセスが良く週末需要が読みづらい都市。
 *  - アジア近接でインバウンド需要もあり、Agoda の在庫・価格競争力が出やすい。
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
  return buildOtaCompareMetadata("fukuoka", lang);
}

const PROFILE: CityOtaProfile = {
  lede: "福岡は博多・天神を中心に駅近ビジネスホテルが密集し、空港アクセスも良い都市。週末やイベント時は価格が動きやすいため、無料キャンセル可プランの早期確保が効きます。グローバル OTA 4 社では、Booking.com が在庫網羅性、Agoda がアジア圏に強くビジネスチェーンの底値、Trip.com が福岡 (FUK) 便とのバンドル割引で強み。Hotellook で楽天・じゃらん含めた実価格と並べると判断が速くなります。",
  overrides: {
    booking: {
      inventoryTilt: "high",
      priceTilt: "mid",
      cityNote:
        "博多・天神・中洲の在庫が厚く、無料キャンセル可プランを見つけやすい",
    },
    agoda: {
      inventoryTilt: "high",
      priceTilt: "high",
      cityNote: "アジア近接でインバウンド在庫も多く、ビジネスチェーンの底値が出やすい",
    },
    trip: {
      inventoryTilt: "mid",
      priceTilt: "mid",
      cityNote: "福岡 (FUK) 着のフライトと同時予約するとバンドル割引が効きやすい",
    },
  },
  segments: {
    budget:
      "博多・天神の駅近ビジネスホテルを狙うなら Agoda の Secret Deals。Hotellook で楽天・じゃらんの価格も並べて最終判断するのが最短ルートです。",
    premium:
      "天神・博多のシティホテルやラグジュアリー系は Booking.com が在庫と無料キャンセル比率ともに強め。Genius 会員ランクを育てておくと継続割引が効きます。",
    instant:
      "福岡 (FUK) 着のフライトと同時に予約するなら Trip.com のバンドル割引が分かりやすく、Trip Coins の継続還元も期待できます。",
  },
};

export default async function Page({ params }: Props) {
  const { lang } = await params;
  return <OtaCompareCityPage slug="fukuoka" lang={lang} profile={PROFILE} />;
}
