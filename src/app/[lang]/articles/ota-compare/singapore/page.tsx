/**
 * /articles/ota-compare/singapore
 * 「シンガポールのホテル予約 Booking vs Agoda vs Trip.com vs Hotellook 徹底比較」
 *
 * 都市別チューニング:
 *  - 1 泊 2-3 万円が当たり前のアジア屈指の高価格帯。マリーナベイ集中で在庫が限られる。
 *  - Agoda が拠点としていた都市で在庫・価格ともに強いが、価格水準自体が高いため
 *    無料キャンセル可プランの有無で実質コストが大きく変わる。
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
  return buildOtaCompareMetadata("singapore");
}

const PROFILE: CityOtaProfile = {
  lede: "シンガポールは 1 泊 2〜3 万円が標準というアジア屈指の高価格帯ホテル都市。Agoda が拠点としていた都市だけあって在庫・価格競争力が強く、Booking.com は外資ラグジュアリーと無料キャンセル可プランの安定感、Trip.com は SIN 着の航空券バンドル割引、Hotellook は価格水準が高いほど 1 泊単位の差額インパクトが大きいため横断比較の価値が高い、という棲み分けです。",
  overrides: {
    booking: {
      inventoryTilt: "high",
      priceTilt: "mid",
      cityNote:
        "マリーナベイ・オーチャードの外資系ラグジュアリーで無料キャンセル可プランが安定",
    },
    agoda: {
      inventoryTilt: "high",
      priceTilt: "high",
      cityNote:
        "Agoda のアジア本拠地。シンガポール系・東南アジア系チェーンで最安帯を更新しやすい",
    },
    trip: {
      inventoryTilt: "mid",
      priceTilt: "mid",
      cityNote:
        "SIN 着の航空券と同時予約でバンドル割引。1 泊単価が高いため Trip Coins 還元も体感しやすい",
    },
    hotellook: {
      inventoryTilt: "high",
      priceTilt: "high",
      cityNote:
        "価格水準が高い都市は横断メタサーチでの数千円差が大きい。最初に Hotellook 推奨",
    },
  },
  segments: {
    budget:
      "リトル・インディア / チャイナタウンの中規模ホテルや 3 つ星帯は Agoda の Secret Deals で底値を引きやすい。Hotellook で楽天/じゃらん含めて並べると 1 泊数千円の差が出ることも。",
    premium:
      "マリーナベイ・サンズ、ラッフルズ シンガポール、ザ・フラトン ホテル シンガポール等の象徴的ホテルは Booking.com が無料キャンセル可プラン込みで安定。直前変更可で保険を効かせたい高単価旅行に最適。",
    instant:
      "SIN 着の航空券と同時予約なら Trip.com のバンドル割引が明確。Trip Coins 還元が継続的に効くため、家族・ビジネス両用途で 2 回目以降の旅行コストが下がりやすい。",
  },
};

export default async function Page({ params }: Props) {
  const { lang } = await params;
  return <OtaCompareCityPage slug="singapore" lang={lang} profile={PROFILE} />;
}
