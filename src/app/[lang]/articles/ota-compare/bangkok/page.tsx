/**
 * /articles/ota-compare/bangkok
 * 「バンコクのホテル予約 Booking vs Agoda vs Trip.com vs Hotellook 徹底比較」
 *
 * 都市別チューニング:
 *  - アジア圏では Agoda の本拠地的存在 (シンガポール拠点) で在庫・価格競争力が極めて強い。
 *  - 5 つ星でも 1 万円台が珍しくないコスパ都市。乾季 (11-2 月) の繁忙期は争奪戦。
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
  return buildOtaCompareMetadata("bangkok");
}

const PROFILE: CityOtaProfile = {
  lede: "バンコクはアジア圏で最も OTA 競争が激しい都市の一つで、5 つ星ホテルが 1〜2 万円台で取れるコスパが魅力。Agoda がアジア系ホテル全般で最安帯を更新しやすく、Booking.com は外資チェーンと無料キャンセル可プランの組合せで安心感が強い。Trip.com は BKK/DMK 着の航空券セット割引、Hotellook はバンコクのように価格差が大きい都市ほど横断メタサーチの有効性が高いという棲み分けです。",
  overrides: {
    booking: {
      inventoryTilt: "high",
      priceTilt: "mid",
      cityNote:
        "スクンビット・サイアム・シーロムの外資系・デザインホテルで無料キャンセル可プランが豊富",
    },
    agoda: {
      inventoryTilt: "high",
      priceTilt: "high",
      cityNote:
        "東南アジア圏は Agoda の本領発揮エリア。Secret Deals + AgodaCash で他社最安を割ることが頻発",
    },
    trip: {
      inventoryTilt: "mid",
      priceTilt: "mid",
      cityNote:
        "BKK/DMK 着の航空券と同時予約でバンドル割引。Trip Coins 還元も継続的",
    },
    hotellook: {
      inventoryTilt: "high",
      priceTilt: "high",
      cityNote:
        "価格差が極めて大きい都市のため、まず Hotellook で 30 秒横断比較が最短ルート",
    },
  },
  segments: {
    budget:
      "スクンビット・カオサン周辺のローカルチェーンや 3-4 つ星帯は Agoda の Secret Deals が最強。1 泊 3,000〜5,000 円でも快適なホテルが豊富。",
    premium:
      "マンダリン オリエンタル バンコク、ペニンシュラ バンコク、シャングリ・ラ バンコク等の老舗ラグジュアリーは Booking.com が無料キャンセル可プラン込みで安定。Genius ランクを育てると継続割引が効く。",
    instant:
      "BKK 着の LCC・FSC と同時予約なら Trip.com のバンドル割引が分かりやすい。乾季 (11-2 月) の繁忙期は早期予約がほぼ必須。",
  },
};

export default async function Page({ params }: Props) {
  const { lang } = await params;
  return <OtaCompareCityPage slug="bangkok" lang={lang} profile={PROFILE} />;
}
