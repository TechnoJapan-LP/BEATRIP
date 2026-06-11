/**
 * /articles/ota-compare/taipei
 * 「台北のホテル予約 Booking vs Agoda vs Trip.com vs Hotellook 徹底比較」
 *
 * 都市別チューニング:
 *  - LCC (Peach/Jetstar/Starlux) で気軽に行ける近場海外として日本人需要が安定。
 *  - 中山・西門町・信義の 3 大エリアで価格差。台湾系チェーンは Agoda の最安提示が強い。
 */

import type { Metadata } from "next";
import {
  buildOtaCompareMetadata,
  OtaCompareCityPage,
  type CityOtaProfile,
} from "@/lib/articles/ota-compare-template";

type Props = { params: Promise<{ lang: string }> };

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  return buildOtaCompareMetadata("taipei");
}

const PROFILE: CityOtaProfile = {
  lede: "台北は LCC (Peach / Jetstar / Starlux 等) で 3〜4 時間圏という気軽さで日本人需要が安定する都市。中山・西門町・信義の 3 大エリアで価格階層が明確に分かれ、台湾系チェーン (シーザーパーク / ハワードプラザ等) は Agoda の最安提示が出やすく、Booking.com は外資系・無料キャンセル可プランで安定。Trip.com は TPE 着のバンドル割引、Hotellook は底値を 30 秒で見るメタサーチとして使い分けるのが効率的です。",
  overrides: {
    booking: {
      inventoryTilt: "high",
      priceTilt: "mid",
      cityNote:
        "中山・信義エリアの外資系ホテルと無料キャンセル可プランが安定。Genius ランク継続的に効果",
    },
    agoda: {
      inventoryTilt: "high",
      priceTilt: "high",
      cityNote:
        "台湾系チェーン (シーザーパーク / ハワードプラザ / コスモス等) で最安帯を更新しやすい",
    },
    trip: {
      inventoryTilt: "mid",
      priceTilt: "mid",
      cityNote:
        "TPE 着の LCC/FSC と同時予約でバンドル割引。Trip Coins 還元も継続的",
    },
  },
  segments: {
    budget:
      "西門町・中山のビジネスホテル帯は Agoda の Secret Deals が刺さりやすく、1 泊 5,000〜8,000 円でも快適な選択肢が豊富。Hotellook で楽天/じゃらん含めて並べると差額が見えやすい。",
    premium:
      "マンダリン オリエンタル 台北、グランド ハイアット 台北、リージェント台北 等のハイクラスは Booking.com が無料キャンセル可プラン込みで安定。直前変更可で保険を効かせたい用途に最適。",
    instant:
      "TPE 着の LCC (Peach / Jetstar / Starlux) と同時予約なら Trip.com のバンドル割引が分かりやすい。Trip Coins と会員ランクで継続還元が期待できる。",
  },
};

export default async function Page({ params }: Props) {
  const { lang } = await params;
  return <OtaCompareCityPage slug="taipei" lang={lang} profile={PROFILE} />;
}
