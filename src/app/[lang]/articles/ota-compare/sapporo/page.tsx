/**
 * /articles/ota-compare/sapporo
 * 「札幌のホテル予約 Booking vs Agoda vs Trip.com vs Hotellook 徹底比較」
 *
 * 都市別チューニング:
 *  - 雪まつり (2 月) など繁忙期は価格が跳ねやすく、早期の無料キャンセル確保が効く都市。
 *  - すすきの・札幌駅周辺のビジネス系チェーンは Agoda の底値が出やすい。
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
  return buildOtaCompareMetadata("sapporo", lang);
}

const PROFILE: CityOtaProfile = {
  lede: "札幌は雪まつり (2 月) やラベンダーの夏など、シーズンで需要が大きく動く都市。繁忙期は早めに無料キャンセル可プランを押さえておくのが鉄則です。グローバル OTA 4 社では、Booking.com がすすきの・札幌駅周辺の在庫網羅性、Agoda が国内ビジネスチェーンの底値、Trip.com が新千歳便とのバンドル割引で強み。Hotellook で楽天・じゃらん含めた実価格と並べると判断が速くなります。",
  overrides: {
    booking: {
      inventoryTilt: "high",
      priceTilt: "mid",
      cityNote:
        "すすきの・札幌駅周辺の在庫が厚く、雪まつり期でも無料キャンセル可プランを探しやすい",
    },
    agoda: {
      inventoryTilt: "high",
      priceTilt: "high",
      cityNote: "東横イン・APA など国内ビジネスチェーンで Secret Deals の底値が出やすい",
    },
    trip: {
      inventoryTilt: "mid",
      priceTilt: "mid",
      cityNote: "新千歳 (CTS) 着のフライトと同時予約するとバンドル割引が効きやすい",
    },
  },
  segments: {
    budget:
      "すすきの・札幌駅周辺の国内ビジネスホテルを狙うなら Agoda の Secret Deals。Hotellook で楽天・じゃらんの価格も並べて最終判断すると取りこぼしが減ります。",
    premium:
      "中心部のシティホテルやラグジュアリー系は Booking.com が在庫と無料キャンセル比率ともに強め。雪まつり期は早期確保が安心です。",
    instant:
      "新千歳 (CTS) 着のフライトと同時に予約するなら Trip.com のバンドル割引が分かりやすく、Trip Coins の継続還元も期待できます。",
  },
};

export default async function Page({ params }: Props) {
  const { lang } = await params;
  return <OtaCompareCityPage slug="sapporo" lang={lang} profile={PROFILE} />;
}
