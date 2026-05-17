export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  image_url: string;
  category: "セール速報" | "攻略ガイド" | "航空会社ニュース" | "旅行Tips";
  airline_tags: string[];
  route_tags: string[];
  published_at: string;
  source?: string;
  source_url?: string;
};

export const articles: Article[] = [
  {
    slug: "ana-super-value-2026-summer",
    title: "ANA スーパーバリューSALE開始！東南アジア・欧州が最大50%OFF",
    excerpt:
      "ANAが2026年夏の大型セールを開始。バンコク往復38,000円、ロンドン往復78,000円など注目路線を解説。",
    body: `ANAが国際線エコノミークラスを対象とした「スーパーバリューSALE」を開始しました。

## セール概要

- **期間**: 2026年5月10日〜5月25日
- **対象**: 国際線エコノミークラス
- **搭乗期間**: 2026年6月1日〜9月30日

## 注目路線

### 東京→バンコク ¥38,000（47%OFF）
通常72,000円のところ、38,000円で購入可能。燃油サーチャージ込みでも45,800円と非常にお得です。過去2年間で最安値を記録しています。

### 東京→ロンドン ¥78,000（45%OFF）
ヨーロッパ路線も大幅割引。夏のロンドン旅行にぴったりのタイミングです。

### 大阪→シンガポール ¥42,000（51%OFF）
関空発着のシンガポール線が半額以下に。残席わずか5席なので早めの予約を。

## 予約のポイント

- 予約期限は**5月24日**まで
- 座席数限定のため、人気路線は早期に埋まる可能性あり
- BEATRIPの「Best Time to Book」機能で最適な予約タイミングをチェック`,
    image_url:
      "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80",
    category: "セール速報",
    airline_tags: ["ANA"],
    route_tags: ["NRT-BKK", "NRT-LHR", "KIX-SIN"],
    published_at: "2026-05-10T09:00:00Z",
  },
  {
    slug: "lcc-beginner-guide-2026",
    title: "【2026年版】LCC格安航空券の買い方完全ガイド",
    excerpt:
      "Peach・Jetstar・Spring Japanなど日本発着LCCのセール攻略法。安く買うコツと注意点を徹底解説。",
    body: `LCC（格安航空会社）のセールを上手に活用すれば、国内・国際線が驚きの価格で手に入ります。

## 日本発着の主要LCC

### Peach Aviation
- **拠点**: 関西国際空港
- **主要路線**: 台北、ソウル、バンコク、国内各地
- **セール頻度**: 年4〜6回の大型セール
- **攻略ポイント**: メガセール時は片道1,990円〜の目玉価格が登場。開始直後にアクセスが集中するため、事前にアカウント作成とログインを済ませておくこと。

### Jetstar Japan
- **拠点**: 成田国際空港
- **主要路線**: マニラ、台北、国内各地
- **セール頻度**: 毎月のようにセールを実施
- **攻略ポイント**: 「スーパースターセール」は72時間限定。金曜夜〜月曜が狙い目。

### Spring Japan
- **拠点**: 成田国際空港
- **主要路線**: 上海、ハルビン、武漢
- **セール頻度**: 不定期（年3〜4回）
- **攻略ポイント**: 中国路線に強く、片道8,800円〜という破格。受託手荷物が別料金なので注意。

## セールを逃さないコツ

1. **BEATRIPの通知機能**を活用してセール開始をリアルタイムでキャッチ
2. **セール予測カレンダー**で次回セールの時期を事前に把握
3. 複数の空港（成田/羽田/関空/福岡）からの価格を比較
4. 受託手荷物・座席指定などの追加料金を含めた**総額**で比較する`,
    image_url:
      "https://images.unsplash.com/photo-1529074963764-98f45c47344b?w=800&q=80",
    category: "攻略ガイド",
    airline_tags: ["Peach", "Jetstar Japan", "Spring Japan"],
    route_tags: ["KIX-TPE", "NRT-MNL", "NRT-PVG"],
    published_at: "2026-05-08T12:00:00Z",
  },
  {
    slug: "cathay-pacific-summer-sale-2026",
    title: "キャセイパシフィック航空がサマーセール開催 香港往復38,000円〜",
    excerpt:
      "キャセイパシフィック航空が夏の香港路線セールを開始。エコノミー38,000円〜、ビジネスクラスも対象。",
    body: `キャセイパシフィック航空が「キャセイ サマーセール」を開催中です。

## セール概要

- **販売期間**: 2026年5月12日〜6月15日
- **搭乗期間**: 2026年7月1日〜9月30日
- **対象クラス**: エコノミー＆ビジネス

## 注目ポイント

成田→香港が往復38,000円（44%OFF）は、FSC（フルサービスキャリア）としては破格。預け荷物・機内食込みでこの価格はLCCより実質的にお得な場合も。

キャセイパシフィックは2025年にラウンジを全面リニューアルしており、香港トランジットの快適さも大幅に向上しています。

## 香港旅行のおすすめ

7月〜9月の香港は暑いですが、ショッピングモールや室内施設が充実しているため十分楽しめます。香港ディズニーランドの夏イベントや、ビクトリアピークの夜景は必見です。`,
    image_url:
      "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800&q=80",
    category: "セール速報",
    airline_tags: ["Cathay Pacific"],
    route_tags: ["NRT-HKG"],
    published_at: "2026-05-12T10:00:00Z",
  },
  {
    slug: "best-time-to-book-explained",
    title: "「Best Time to Book」機能の使い方 — AIが教える最安値のタイミング",
    excerpt:
      "BEATRIPの予約タイミング予測機能を徹底解説。過去の価格データから最適な予約時期をAIが分析。",
    body: `BEATRIPの「Best Time to Book」機能は、過去の価格データを分析して最適な予約タイミングを提案します。

## 仕組み

各路線について、過去12ヶ月分の平均価格データを収集・分析。月ごとの価格トレンドから、統計的に最も安くなる月を特定します。

## 信頼度スコア

予測の信頼度は2つの要素から算出されます：

1. **月カバー率（60%）**: 12ヶ月すべてのデータが揃っているか
2. **サンプル数（40%）**: 各月のデータポイント数

信頼度80%以上の予測は、過去のデータに十分な裏付けがあることを意味します。

## 活用例

### NRT→BKK（東京→バンコク）
- **ベスト**: 5月（年間平均より約22%安い）
- **避けるべき**: 7〜8月（ハイシーズンで最も高い）

### HND→CDG（東京→パリ）
- **ベスト**: 5月（年間平均より約21%安い）
- **避けるべき**: 7〜8月（夏休みシーズン）

## Tips

セール価格とBest Time to Bookが重なるタイミングが、最もお得に航空券を購入できるチャンスです。BEATRIPの通知機能と組み合わせて活用しましょう。`,
    image_url:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    category: "攻略ガイド",
    airline_tags: [],
    route_tags: ["NRT-BKK", "HND-CDG"],
    published_at: "2026-05-05T08:00:00Z",
  },
  {
    slug: "tway-air-korea-deals",
    title: "ティーウェイ航空「ハッピーセール」で韓国往復6,900円〜",
    excerpt:
      "韓国LCCのT'way Airが日本路線を大幅値下げ。福岡・大阪・東京発のソウル行きが過去最安水準。",
    body: `韓国のLCC・ティーウェイ航空が「ハッピーセール」を実施中。日本各地からソウルへの路線が大幅に値下げされています。

## セール価格

| 路線 | セール価格 | 割引率 |
|------|-----------|--------|
| 福岡→ソウル | ¥6,900 | 62%OFF |
| 大阪→ソウル | ¥7,500 | 61%OFF |

## ティーウェイ航空とは？

韓国を拠点とするLCCで、日本路線を多数運航しています。機内サービスは最低限ですが、短距離の韓国旅行には十分。預け荷物15kgまで無料という点がJetstarやPeachとの大きな違いです。

## 予約のポイント

- 予約期限: 2026年5月20日まで
- 搭乗期間: 2026年6月1日〜7月31日
- 残席10席 — 週末便は特に早く埋まる傾向`,
    image_url:
      "https://images.unsplash.com/photo-1534274867514-d5b47ef89ed7?w=800&q=80",
    category: "セール速報",
    airline_tags: ["T'way Air"],
    route_tags: ["FUK-ICN", "KIX-ICN"],
    published_at: "2026-05-11T11:00:00Z",
  },
  {
    slug: "emirates-global-sale-2026",
    title: "エミレーツ航空グローバルセール — ドバイ経由で世界へ",
    excerpt:
      "エミレーツ航空が年2回の大型セールを開催。東京→ドバイ68,000円〜、ビジネスクラスも対象。",
    body: `エミレーツ航空の「グローバルセール」が始まりました。半年に一度の大型セールで、エコノミーからビジネスクラスまで幅広い路線が対象です。

## 注目路線

### 東京→ドバイ ¥68,000（46%OFF）
エコノミークラスでも機内エンターテインメント「ice」は約6,500チャンネル。長距離フライトも快適です。

### 東京→ドバイ ビジネスクラス ¥298,000（43%OFF）
フルフラットシート、機内シャワー（A380）、ラウンジアクセス付き。通常50万円以上するビジネスクラスがこの価格はかなりレアです。

## ドバイ・ストップオーバー

エミレーツはドバイでの途中降機プログラムを提供しており、ヨーロッパやアフリカへの乗り継ぎ時にドバイ観光を楽しむことも可能。ホテル割引も提供されています。

## セール情報

- **販売期間**: 2026年5月10日〜6月10日
- **搭乗期間**: 2026年6月15日〜12月15日
- **予約期限**: 6月9日`,
    image_url:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    category: "セール速報",
    airline_tags: ["Emirates"],
    route_tags: ["NRT-DXB"],
    published_at: "2026-05-10T14:00:00Z",
  },
];

export function getArticleBySlug(slug: string) {
  return articles.find((a) => a.slug === slug);
}

export function getRelatedArticles(slug: string, limit = 3) {
  const article = getArticleBySlug(slug);
  if (!article) return [];
  return articles
    .filter((a) => a.slug !== slug)
    .filter(
      (a) =>
        a.airline_tags.some((t) => article.airline_tags.includes(t)) ||
        a.route_tags.some((t) => article.route_tags.includes(t)) ||
        a.category === article.category
    )
    .slice(0, limit);
}
