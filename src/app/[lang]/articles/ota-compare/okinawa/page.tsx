/**
 * /articles/ota-compare/okinawa
 * 「沖縄のホテル予約 Booking vs Agoda vs Trip.com vs Hotellook 徹底比較」
 *
 * 都市別チューニング:
 *  - 国内リゾートのため楽天/じゃらん等の国内 OTA も強いが、本記事は 4 大グローバル OTA に絞る。
 *  - 恩納村のリゾートホテルとビジネス系 (那覇) で最適サイトが変わる点に注意。
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
  return buildOtaCompareMetadata("okinawa", lang);
}

const PROFILE: CityOtaProfile = {
  lede: "沖縄は那覇の街なかビジネスホテルから恩納村のリゾート、離島のステイまで宿のタイプが幅広い都市。グローバル OTA 4 社のうち、Booking.com は無料キャンセル可プランの選びやすさ、Agoda はアジア系チェーンや国内ビジネスホテルの底値、Trip.com は那覇便と宿のバンドル割引が強み。最終的には Hotellook で楽天・じゃらん含めた実価格を横並びにするのが効率的です。",
  overrides: {
    booking: {
      inventoryTilt: "high",
      priceTilt: "mid",
      cityNote:
        "那覇・国際通り周辺のホテル網羅性が高く、繁忙期でも無料キャンセル可プランを見つけやすい",
    },
    agoda: {
      inventoryTilt: "high",
      priceTilt: "high",
      cityNote: "那覇のビジネスホテルや本島リゾートで Secret Deals の底値が出やすい",
    },
    trip: {
      inventoryTilt: "mid",
      priceTilt: "mid",
      cityNote: "那覇 (OKA) 着のフライトと同時予約するとセット割引が効きやすい",
    },
  },
  segments: {
    budget:
      "那覇市内のビジネスホテルやゲストハウスを狙うなら Agoda の Secret Deals。Hotellook で楽天・じゃらんの国内向け価格と並べて最終判断するのが最短ルートです。",
    premium:
      "恩納村・読谷のビーチリゾートやラグジュアリー系は Booking.com が在庫と無料キャンセル比率ともに強め。梅雨明け以降の繁忙期は早期確保が安心です。",
    instant:
      "那覇 (OKA) 着のフライトと同時に予約するなら Trip.com のバンドル割引が分かりやすく、Trip Coins の継続還元も期待できます。",
  },
};

export default async function Page({ params }: Props) {
  const { lang } = await params;
  return <OtaCompareCityPage slug="okinawa" lang={lang} profile={PROFILE} />;
}
