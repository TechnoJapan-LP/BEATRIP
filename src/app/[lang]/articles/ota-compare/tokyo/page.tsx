/**
 * /articles/ota-compare/tokyo
 * 「東京のホテル予約 Booking vs Agoda vs Trip.com vs Hotellook 徹底比較」
 *
 * 都市別チューニング:
 *  - 東京は楽天/じゃらん等の国内 OTA も強いが、本記事は 4 大グローバル OTA に絞る
 *    (国内 OTA 含む比較は /ota-sales で別途展開)。
 *  - Booking.com の在庫量・無料キャンセル比率が特に強い都市。
 */

import type { Metadata } from "next";
import {
  buildOtaCompareMetadata,
  OtaCompareCityPage,
  type CityOtaProfile,
} from "@/lib/articles/ota-compare-template";

type Props = { params: Promise<{ lang: string }> };

// ISR: 21600 秒 (6 時間)
export const revalidate = 86400;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return buildOtaCompareMetadata("tokyo", lang);
}

const PROFILE: CityOtaProfile = {
  lede: "東京は世界有数のホテル数を抱える都市。グローバル OTA 4 社を比較すると、在庫量と無料キャンセルプランの豊富さで Booking.com が一段抜けつつ、Agoda はアジア系チェーン (東横イン・APA 等含む) を最安水準で出すことが多い。Trip.com は航空券同時予約のバンドル割引、Hotellook は最短で底値を確認するメタサーチとして使い分けるのが効率的です。",
  overrides: {
    booking: {
      inventoryTilt: "high",
      priceTilt: "mid",
      cityNote:
        "新宿・銀座・浅草など中心エリアの在庫網羅性が高く、無料キャンセル可プランが見つけやすい",
    },
    agoda: {
      inventoryTilt: "high",
      priceTilt: "high",
      cityNote: "東横イン/APA等の国内ビジネスホテル系チェーンも最安水準が出やすい",
    },
    trip: {
      inventoryTilt: "mid",
      priceTilt: "mid",
      cityNote: "成田/羽田着の航空券とホテルを同時予約するとセット割引が効きやすい",
    },
  },
  segments: {
    budget:
      "東横イン・APA・スーパーホテル等の国内ビジネス系を狙うなら Agoda の Secret Deals。Hotellook で楽天/じゃらん含めた価格と並べて最終判断するのが最短ルート。",
    premium:
      "新宿パークハイアット、コンラッド東京、ザ・リッツ・カールトン等のラグジュアリー系は Booking.com が在庫・無料キャンセル比率ともに強い。Genius 会員ランクを育てておくと継続的に 10〜20% 割引が効く。",
    instant:
      "成田/羽田着のフライトと同時に予約するなら Trip.com のバンドル割引が最も明確。会員ランクと Trip Coins で継続還元も期待できる。",
  },
};

export default async function Page({ params }: Props) {
  const { lang } = await params;
  return <OtaCompareCityPage slug="tokyo" lang={lang} profile={PROFILE} />;
}
