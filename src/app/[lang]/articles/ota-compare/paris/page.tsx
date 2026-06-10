/**
 * /articles/ota-compare/paris
 * 「パリのホテル予約 Booking vs Agoda vs Trip.com vs Hotellook 徹底比較」
 *
 * 都市別チューニング:
 *  - 欧州系の独立系ホテルが多く、Booking.com の在庫網羅性が際立つ都市。
 *  - Agoda はアジア系より弱まるが Insider Deals で底値が出ることも。観光税 (taxe de séjour) に注意。
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
  return buildOtaCompareMetadata("paris", lang);
}

const PROFILE: CityOtaProfile = {
  lede: "パリは小規模な独立系ホテルやブティックホテルが多く、欧州に強い Booking.com の在庫網羅性が際立つ都市。ハイシーズン (春・秋) は価格が跳ねやすいため、無料キャンセル可プランの早期確保が効きます。Agoda はアジア圏ほどの優位はないものの Insider Deals で底値が出ることがあり、Trip.com は CDG 着便とのバンドル割引が強み。宿泊時には観光税 (taxe de séjour) が別途加算される点に注意し、Hotellook で各社の総額を見比べましょう。",
  overrides: {
    booking: {
      inventoryTilt: "high",
      priceTilt: "mid",
      cityNote:
        "マレ地区・モンマルトル等の小規模ホテルまで在庫が厚く、無料キャンセル可プランが豊富",
    },
    agoda: {
      inventoryTilt: "mid",
      priceTilt: "high",
      cityNote: "欧州在庫は Booking ほどではないが、Insider Deals で底値が出ることがある",
    },
    trip: {
      inventoryTilt: "mid",
      priceTilt: "mid",
      cityNote: "CDG 着のフライトと同時予約するとバンドル割引が効きやすい",
    },
  },
  segments: {
    budget:
      "予算重視なら Hotellook で 4 社+地場 OTA を横断比較し、Agoda の Insider Deals と見比べて最安を確認。観光税が別加算になる物件もあるため総額で判断しましょう。",
    premium:
      "1 区やマレ地区のブティックホテル・ラグジュアリー系は Booking.com が在庫と無料キャンセル比率ともに最も強め。予定変更の可能性があるなら柔軟プラン優先が安心です。",
    instant:
      "CDG 着のフライトと同時に予約するなら Trip.com のバンドル割引が分かりやすく、会員ランクや Trip Coins の継続還元も期待できます。",
  },
};

export default async function Page({ params }: Props) {
  const { lang } = await params;
  return <OtaCompareCityPage slug="paris" lang={lang} profile={PROFILE} />;
}
