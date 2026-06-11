/**
 * /articles/rankings/family
 * 「ファミリー向けホテル TOP 10 — 子連れ・家族旅行に最適」
 */

import type { Metadata } from "next";
import {
  buildRankingMetadata,
  RankingPage,
  type RankingSegment,
} from "@/lib/articles/ranking-template";

type Props = { params: Promise<{ lang: string }> };

export const revalidate = 86400;

const SEG: RankingSegment = {
  slug: "family",
  filterKey: "family",
  path: "family",
  navLabel: "ファミリー向け",
  title: "ファミリー向けホテル TOP 10 — 子連れ・家族旅行に最適 (2026年版)",
  description:
    "子連れ・家族旅行に最適な編集部選定ホテル TOP 10。キッズプログラム・コネクティングルーム・プール・送迎など、家族で快適に過ごせる設備を軸に絞り込みました。",
  lede: "小さなお子様連れから三世代旅行まで、家族で快適に過ごせる編集部選定のファミリー向けホテル TOP 10。キッズフレンドリー設備・プール・コネクティングルーム対応を軸に選定しました。",
  heroGradient: "from-amber-500 via-orange-500 to-rose-500",
  keywords: [
    "ファミリー ホテル",
    "家族旅行 ホテル",
    "子連れ ホテル",
    "キッズフレンドリー",
    "コネクティングルーム",
    "ファミリー 宿泊 ランキング",
    "家族 旅行",
    "ホテル ランキング 2026",
  ],
  faqs: [
    {
      q: "ファミリー向けホテルの選び方は？",
      a: "ロケーション (空港/駅アクセス)、客室タイプ (トリプル / クアッド / コネクティングルーム可否)、館内プール・キッズプログラム、ベビーベッド/離乳食対応の 4 軸で比較するのが効率的。3-4 歳以下なら「ベビーベッド無料貸出」「離乳食提供」可否を予約前に必ず確認しましょう。",
    },
    {
      q: "子連れで快適な客室タイプは？",
      a: "0-3 歳ならダブルベッド + ベビーベッド、4-12 歳ならツインベッド + エキストラベッド、または 2 部屋使えるコネクティングルームが鉄板。Booking.com / Agoda どちらも検索フィルタで「子供 X 人」を指定すると対応プランのみ表示されます。",
    },
    {
      q: "リゾートホテルは何泊ぐらいが目安？",
      a: "国内リゾート (沖縄等) なら 3-4 泊、海外ビーチリゾート (ハワイ・グアム・バリ) なら 5-7 泊が定番。プール・キッズプログラムを満喫するなら最低 3 泊以上 (1 日目移動、2-3 日目滞在、4 日目チェックアウト) が満足度高めです。",
    },
    {
      q: "三世代旅行で気をつけることは？",
      a: "祖父母世代の体力配慮で「館内完結 (温泉・レストラン・売店)」型のホテルが理想。本ランキング掲載のリゾート系 (沖縄・ハワイ) はいずれも館内で 1 日過ごせる構成。エレベーター・段差・浴室の手すり等のバリアフリー対応は予約前に直接確認推奨です。",
    },
    {
      q: "ランキングの順位はどう決めていますか？",
      a: "CURATED_HOTELS 編集部キュレートデータから「ファミリー」適性タグを持つホテルを抽出し、ラグジュアリー優先 + 編集部レビュースコア順で並べています。固定順位ではなく編集部の見解であり、実価格・空室は予約直前画面でご確認ください。",
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
