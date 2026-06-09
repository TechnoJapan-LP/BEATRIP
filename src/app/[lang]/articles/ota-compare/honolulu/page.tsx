/**
 * /articles/ota-compare/honolulu
 * 「ホノルルのホテル予約 Booking vs Agoda vs Trip.com vs Hotellook 徹底比較」
 *
 * 都市別チューニング:
 *  - ワイキキ中心の高単価市場。為替・繁忙期影響が大きく、OTA 間の価格差も大きい。
 *  - リゾートフィー込み合計の確認が極めて重要なため、その注意喚起を強める。
 */

import type { Metadata } from "next";
import {
  buildOtaCompareMetadata,
  OtaCompareCityPage,
  type CityOtaProfile,
} from "@/lib/articles/ota-compare-template";

type Props = { params: Promise<{ lang: string }> };

export const revalidate = 21600;

export async function generateMetadata(): Promise<Metadata> {
  return buildOtaCompareMetadata("honolulu");
}

const PROFILE: CityOtaProfile = {
  lede: "ホノルル (ワイキキ) は 1 泊あたりの単価が高く、為替と繁忙期で OTA 間の価格差が大きく開く市場。Booking.com の在庫網羅性、Agoda の底値、Trip.com の航空券+ホテル同時割引、Hotellook の横断比較、と 4 サイトを使い分ける価値が最も高い都市のひとつです。表示価格にリゾートフィー (Resort Fee) が含まれるかは必ず予約直前で確認してください。",
  overrides: {
    booking: {
      inventoryTilt: "high",
      priceTilt: "mid",
      cityNote:
        "ヒルトン・ハワイアン・ビレッジ等の大型リゾート系も在庫が手厚い。無料キャンセルプランが選べる",
    },
    agoda: {
      inventoryTilt: "mid",
      priceTilt: "high",
      cityNote:
        "Secret Deals 時はワイキキ中心部の中高級クラスで他社比 10% 程度安いことが珍しくない",
    },
    trip: {
      inventoryTilt: "mid",
      priceTilt: "high",
      cityNote:
        "HNL 着の国際線とのバンドル割引が高単価市場ほど絶対額で効く。為替・燃油サーチャージの影響を吸収しやすい",
    },
    hotellook: {
      inventoryTilt: "high",
      priceTilt: "high",
      cityNote:
        "価格差が大きい市場ほど横断比較の価値が高い。まず Hotellook で底値を把握するのを推奨",
    },
  },
  segments: {
    budget:
      "ワイキキ外周や中規模ホテルなら Agoda の Secret Deals + Hotellook 比較が王道。リゾートフィー込みの最終合計で他社と比べないと、見かけ最安が逆転することがある点に注意。",
    premium:
      "ハレクラニ、ザ・リッツ・カールトン・レジデンス ワイキキビーチ等のラグジュアリー系は Booking.com が無料キャンセル可プランで強い。長期滞在/家族旅行は Genius 会員割引が金額として効きやすい。",
    instant:
      "HNL 着の JAL/ANA/ZIPAIR/ハワイアン航空便と同時予約するなら Trip.com のセット割引。高単価市場ほどバンドル割引の絶対額が大きく、為替変動の影響も吸収しやすい。",
  },
};

export default async function Page({ params }: Props) {
  const { lang } = await params;
  return <OtaCompareCityPage slug="honolulu" lang={lang} profile={PROFILE} />;
}
