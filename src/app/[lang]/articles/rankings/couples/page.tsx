/**
 * /articles/rankings/couples
 * 「カップル向けホテル TOP 10 — 二人旅・記念日に最適」
 */

import type { Metadata } from "next";
import {
  buildRankingMetadata,
  RankingPage,
  type RankingSegment,
} from "@/lib/articles/ranking-template";

type Props = { params: Promise<{ lang: string }> };

export const revalidate = 21600;

const SEG: RankingSegment = {
  slug: "couples",
  filterKey: "couple",
  path: "couples",
  navLabel: "カップル向け",
  title: "カップル向けホテル TOP 10 — 二人旅・記念日に最適 (2026年版)",
  description:
    "二人旅・記念日・ハネムーンに最適な編集部選定ホテル TOP 10。国内外のラグジュアリー〜ハイクラス帯から、ロケーション・客室・サービスを軸に絞り込みました。",
  lede: "二人で過ごす特別な時間にふさわしい、編集部選定のカップル向けホテル TOP 10。眺望・スパ・記念日対応など、ふたり旅で評価が高い設備とロケーションを軸に選定しました。",
  heroGradient: "from-rose-500 via-pink-500 to-fuchsia-600",
  keywords: [
    "カップル ホテル",
    "二人旅 ホテル",
    "記念日 ホテル",
    "ハネムーン ホテル",
    "カップル 宿泊",
    "デート ホテル ランキング",
    "カップル 旅行",
    "ホテル ランキング 2026",
  ],
  faqs: [
    {
      q: "カップル向けホテルの選び方は？",
      a: "ロケーション (繁華街/景観)、客室タイプ (ダブル/キング ベッド、バスルームの広さ)、スパ・温泉・ラウンジ等の館内施設、記念日対応 (花束/シャンパン等のオプション) の 4 軸で比較するのが効率的です。記念日利用なら予約時に「アニバーサリー」のリクエストを送るとほぼ無料で対応してくれるホテルが多いです。",
    },
    {
      q: "二人旅で予算を抑える方法は？",
      a: "平日泊・連泊割引・早期予約 (45-60 日前) ・OTA セール時期 (Booking 月初、Agoda 不定期) を組み合わせるのが基本。ラグジュアリーは「ベスト・フレキシブル」より「事前決済 非返金」レートの方が 15-30% 安いことが多く、変更可能性が低いカップル旅行なら有効です。",
    },
    {
      q: "プロポーズや記念日に最適なのは？",
      a: "眺望ルーム + ディナー予約 + ホテルへ事前リクエストの 3 点セットが鉄板。本ランキングのラグジュアリーホテル (パークハイアット東京、リッツカールトン大阪、コンラッド東京/大阪等) はいずれも記念日対応の実績があり、Booking.com のリクエスト欄や予約直後のメールで事前相談しておくと当日のサプライズ演出がスムーズです。",
    },
    {
      q: "海外と国内、どちらがカップル向き？",
      a: "短期 (2-3 泊) なら国内ラグジュアリー、長期 (4 泊以上) なら海外リゾート (バリ・モルディブ・ハワイ等) が定番。ただし国内ラグジュアリーは 1 泊 5-10 万円帯が珍しくなく、海外リゾートの方が同予算で「眺望 + プール + スパ」を取りやすいケースもあります。",
    },
    {
      q: "ランキングの順位はどう決めていますか？",
      a: "CURATED_HOTELS 編集部キュレートデータから「カップル」適性タグを持つホテルを抽出し、ラグジュアリー優先 + 編集部レビュースコア順で並べています。固定順位ではなく編集部の見解であり、実価格・空室は予約直前画面でご確認ください。",
    },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  return buildRankingMetadata(SEG);
}

export default async function Page({ params }: Props) {
  const { lang } = await params;
  return <RankingPage seg={SEG} lang={lang} />;
}
