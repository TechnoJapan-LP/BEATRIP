import type { Metadata } from "next";
import {
  buildGuideMetadata,
  GuidePage,
  type GuideContent,
} from "@/lib/articles/guide-template";

type Props = { params: Promise<{ lang: string }> };

export const revalidate = 21600;

const CONTENT: GuideContent = {
  slug: "best-booking-timing",
  metaTitle: "航空券を最安で買うベストタイミング — 予約時期の考え方ガイド",
  metaDescription:
    "航空券をなるべく安く買うための予約タイミングの考え方を整理。国内線・国際線・LCC・繁忙期それぞれの傾向と、価格変動への向き合い方を解説します。",
  keywords: [
    "航空券 安い時期",
    "航空券 予約 タイミング",
    "航空券 いつ買う",
    "飛行機 チケット 安く",
    "国際線 予約 時期",
    "繁忙期 航空券",
    "早割 航空券",
  ],
  title: "航空券を最安で買うベストタイミング",
  lede:
    "航空券の価格は需要と空席状況で常に変動するため「絶対にこの日が最安」という単一の正解はありません。それでも、過去の傾向から導ける予約タイミングの考え方を、国内線・国際線・繁忙期に分けて整理しました。",
  published: "2026-06-10",
  sections: [
    {
      heading: "価格は「需要」で動くという前提",
      paragraphs: [
        "航空券は在庫 (座席) が限られた商品で、売れ行きに応じて価格が段階的に変わるのが一般的です。空席が多いうちは安い運賃クラスが残り、埋まってくると高い運賃クラスしか残らなくなります。",
        "つまり「いつ買うか」より「需要が集中する前に買えるか」が本質です。混む時期ほど早めの確保が効きます。",
      ],
    },
    {
      heading: "国内線の目安",
      paragraphs: [
        "国内線は各社の早期購入割引 (早割) が用意されていることが多く、出発のかなり前から購入できるなら早割の対象になりやすいです。一方で、需要の低い時期は直前に安い運賃が出ることもあります。",
      ],
      bullets: [
        { label: "早割を狙う", text: "予定が固まっているなら早期購入割引の対象期間を確認する。" },
        { label: "閑散期の直前", text: "需要が低い日は直前に安価な席が残ることもある。" },
        { label: "曜日の影響", text: "一般に平日発着は週末より需要が低い傾向がある。" },
      ],
    },
    {
      heading: "国際線の目安",
      paragraphs: [
        "国際線は路線や季節で価格幅が大きく、人気路線の繁忙期は早く埋まりがちです。予定が決まっているなら早めに押さえ、価格を観測しながら判断するのが現実的です。",
        "セール運賃は出発のかなり前に販売されることが多いため、行き先が決まっているなら各社のセール情報を継続的にチェックしておきましょう。",
      ],
    },
    {
      heading: "繁忙期は「早さ」が最優先",
      paragraphs: [
        "年末年始・ゴールデンウィーク・お盆などの大型連休は需要が集中し、安い運賃クラスから順に埋まっていきます。これらの時期は「待っても安くならない」ことが多く、早期確保が最も効きます。",
      ],
      note: "繁忙期は変更不可・払い戻し不可の運賃でも当日争奪になりやすいため、予定が固まり次第の確保がおすすめです。",
    },
    {
      heading: "価格変動への向き合い方",
      bullets: [
        { label: "価格を記録する", text: "気になる路線は数日おきに価格を見て相場感をつかむ。" },
        { label: "セール情報を集約", text: "各社のセール時期をまとめて把握できる手段を使う。" },
        { label: "完璧を狙わない", text: "底値を当て続けるのは困難。納得できる価格で確保する。" },
      ],
    },
  ],
  faqs: [
    {
      q: "航空券は何日前に買うのが一番安いですか?",
      a: "路線・季節・需要によって変わるため、特定の「何日前が最安」という固定の正解はありません。混む時期ほど早めの確保が効き、閑散期は直前に安い席が残ることもあります。",
    },
    {
      q: "早く買うほど安くなりますか?",
      a: "需要が集中する路線・時期では、早いほど安い運賃クラスが残りやすく有利です。一方、需要の低い日程では直前に値下がりすることもあるため、相場を見ながら判断するのが現実的です。",
    },
    {
      q: "繁忙期はいつ予約すべきですか?",
      a: "年末年始・GW・お盆などは需要が集中して安い運賃から埋まるため、予定が固まり次第なるべく早く確保するのが基本です。待っても安くならないことが多い時期です。",
    },
    {
      q: "セール運賃はいつ販売されますか?",
      a: "セールは出発のかなり前に販売されることが多く、時期は航空会社ごとに異なります。行き先が決まっているなら各社のセール情報を継続的にチェックすると逃しにくいです。",
    },
  ],
  aspCategories: ["flight-domestic", "flight-overseas", "tour-package", "insurance"],
  aspTitle: "航空券・ツアーを比較して予約",
  aspSubtitle: "航空券やパッケージツアーを信頼できるサービスから比較",
  aspSource: "guide-best-booking-timing",
  relatedLinks: [
    { href: "/articles/sale-prediction-2027", label: "2027 セール予測", desc: "JAL/ANA/LCC のセール時期予測" },
    { href: "/articles/guides/lcc-tips", label: "LCC を最大活用する 10 のコツ", desc: "格安航空券で失敗しない使い方" },
    { href: "/articles/guides/miles-complete-guide", label: "マイルの貯め方・使い方 完全ガイド", desc: "特典航空券で航空券代を抑える" },
    { href: "/seasons/golden-week", label: "GW の予約攻略", desc: "繁忙期に間に合う狙い目" },
  ],
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return buildGuideMetadata(CONTENT, lang);
}

export default async function Page({ params }: Props) {
  const { lang } = await params;
  return <GuidePage content={CONTENT} lang={lang} />;
}
