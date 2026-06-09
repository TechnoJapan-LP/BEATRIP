/**
 * /articles/rankings/solo
 * 「一人旅向けホテル TOP 10 — ソロ滞在で快適に過ごせる」
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
  slug: "solo",
  filterKey: "solo",
  path: "solo",
  navLabel: "一人旅向け",
  title: "一人旅向けホテル TOP 10 — ソロ滞在で快適に過ごせる (2026年版)",
  description:
    "ソロ旅行・一人滞在に最適な編集部選定ホテル TOP 10。駅近・館内完結・安全性・コスパを軸に、国内外の主要都市から選定しました。",
  lede: "ひとりでも気兼ねなく過ごせる、編集部選定の一人旅向けホテル TOP 10。駅近のアクセス性・館内設備の充実度・安全性・コスパを軸に、国内外の主要都市から選びました。",
  heroGradient: "from-sky-500 via-indigo-500 to-violet-600",
  keywords: [
    "一人旅 ホテル",
    "ソロ ホテル",
    "ひとり旅 宿泊",
    "シングルルーム",
    "一人旅 ランキング",
    "ビジネスホテル ランキング",
    "ソロ 旅行",
    "ホテル ランキング 2026",
  ],
  faqs: [
    {
      q: "一人旅でホテルを選ぶポイントは？",
      a: "駅徒歩 5 分以内のアクセス、館内レストラン/ラウンジの有無 (外出せずに食事完結)、Wi-Fi 速度、セキュリティ (オートロック・フロント 24h 体制) の 4 軸が定番。コスパ重視ならミドルクラスのビジネスホテル系、滞在自体を楽しむならハイクラス以上が快適です。",
    },
    {
      q: "ソロ料金とダブル料金、どちらが安い？",
      a: "国内ビジネスホテル系はシングルプランがあり 1 人料金が明確ですが、海外ホテルや国内ハイクラスは「1 室料金」のため 1 人で泊まっても 2 人と同額のことが多いです。Agoda / Booking.com 検索時に「人数 1 名」で絞ると、シングル対応プランが優先表示されます。",
    },
    {
      q: "海外一人旅で気をつけることは？",
      a: "セーフティボックスがある部屋を選ぶ、ホテル住所/緊急連絡先を別途控えておく、夜の出入りは正面ロビー経由 (裏口は避ける)、海外旅行保険 (クレカ付帯含む) を必ず確認、の 4 点が基本。本ランキングに含まれる外資系チェーンは概ねセキュリティ標準化されており初めての海外一人旅にも適しています。",
    },
    {
      q: "ワーケーション目的なら？",
      a: "デスク + Wi-Fi 速度 + 静音性の 3 点が必須。本ランキング上位のハイクラスホテルは多くが客室内デスク + ビジネスセンター完備。連泊割引が効くことも多く、Booking.com の「7 泊以上で X% OFF」プランや Agoda の長期割引を活用すると 30-40% 安くなることもあります。",
    },
    {
      q: "ランキングの順位はどう決めていますか？",
      a: "CURATED_HOTELS 編集部キュレートデータから「ソロ」適性タグを持つホテルを抽出し、ラグジュアリー優先 + 編集部レビュースコア順で並べています。固定順位ではなく編集部の見解であり、実価格・空室は予約直前画面でご確認ください。",
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
