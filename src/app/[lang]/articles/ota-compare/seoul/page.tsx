/**
 * /articles/ota-compare/seoul
 * 「ソウルのホテル予約 Booking vs Agoda vs Trip.com vs Hotellook 徹底比較」
 *
 * 都市別チューニング:
 *  - K-pop/コスメ需要で日本人の渡航が多く、明洞・弘大・江南で価格差が大きい。
 *  - 韓国系チェーン (L7 / Lotte 等) は Agoda の最安提示が出やすい都市。
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
  return buildOtaCompareMetadata("seoul");
}

const PROFILE: CityOtaProfile = {
  lede: "ソウルは日本から 2.5 時間圏の近場海外として常時需要が高く、明洞・弘大・江南でホテル価格の階層が大きく分かれる都市。アジア圏に強い Agoda が韓国系チェーン (Lotte / L7 / Shilla 等) の最安帯を出すことが多く、Booking.com は外資系・無料キャンセル可プランの安定感、Trip.com は仁川 (ICN) 着の航空券バンドル割引が明確。底値を 30 秒で見たいなら Hotellook で横断比較が最短です。",
  overrides: {
    booking: {
      inventoryTilt: "high",
      priceTilt: "mid",
      cityNote:
        "明洞・江南エリアの外資系ホテルと中規模ブティック系の在庫が安定。Genius 会員割引が効きやすい",
    },
    agoda: {
      inventoryTilt: "high",
      priceTilt: "high",
      cityNote:
        "韓国系チェーン (Lotte / L7 / Shilla 等) や弘大エリアのデザインホテルで最安帯を更新しやすい",
    },
    trip: {
      inventoryTilt: "mid",
      priceTilt: "mid",
      cityNote:
        "ICN/GMP 着の航空券と同時予約するとバンドル割引が比較的明確",
    },
  },
  segments: {
    budget:
      "弘大・明洞のゲストハウス〜ビジネスホテル帯は Agoda の Secret Deals が刺さりやすい。LCC (ZIPAIR/Peach) で予約済みなら Hotellook で楽天/じゃらん含めた価格と並べて最終判断するのが効率的。",
    premium:
      "ロッテホテル ソウル本館、シグニエル ソウル、ザ・シラ ソウル等のラグジュアリーは Booking.com が無料キャンセル込みで安定。Genius ランクを育てておくと継続的に 10〜20% 割引が効く。",
    instant:
      "ICN 着の航空券と同時予約なら Trip.com のバンドル割引。Trip Coins と会員ランクの継続還元で 2 回目以降のソウル旅行コストが下がりやすい。",
  },
};

export default async function Page({ params }: Props) {
  const { lang } = await params;
  return <OtaCompareCityPage slug="seoul" lang={lang} profile={PROFILE} />;
}
