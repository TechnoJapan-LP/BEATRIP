/**
 * 各都市の代表的なホテルのキュレート情報
 *
 * Hotellook ブランドは 2025年10月に閉鎖され API も利用不可。代わりに
 * 編集者がキュレートした有名ホテルを表示する。クリック時のリンク先は
 * Hotellook の都市検索（marker 帰属付き）に集約 — そこから絞り込み。
 *
 * 価格目安は2026年時点の3-5星帯のおおよそ。実際は変動する。
 */

export type CuratedHotel = {
  name: string;
  area: string;
  tier: "ラグジュアリー" | "ハイクラス" | "ミドル" | "バジェット";
  /** 1行のセリングポイント */
  highlight: string;
};

export const CURATED_HOTELS: Record<string, CuratedHotel[]> = {
  tokyo: [
    { name: "Park Hyatt Tokyo", area: "新宿", tier: "ラグジュアリー", highlight: "新宿摩天楼一望・映画ロケ地で有名" },
    { name: "Mandarin Oriental Tokyo", area: "日本橋", tier: "ラグジュアリー", highlight: "ミシュラン星付きレストランを多数擁する高層階ホテル" },
    { name: "Andaz Tokyo", area: "虎ノ門", tier: "ハイクラス", highlight: "虎ノ門ヒルズ最上層・モダンデザイン" },
    { name: "Hotel Gracery Shinjuku", area: "新宿歌舞伎町", tier: "ミドル", highlight: "ゴジラヘッドが目印・繁華街アクセス抜群" },
    { name: "MIMARU TOKYO STATION EAST", area: "東京駅", tier: "ミドル", highlight: "アパートメント型・家族・長期滞在向き" },
  ],
  osaka: [
    { name: "Conrad Osaka", area: "中之島", tier: "ラグジュアリー", highlight: "高層40Fからの大阪パノラマ・ビジネス利用も" },
    { name: "The Ritz-Carlton, Osaka", area: "梅田", tier: "ラグジュアリー", highlight: "梅田駅徒歩7分・ハイティーが名物" },
    { name: "Hotel Vischio Osaka by GRANVIA", area: "梅田", tier: "ハイクラス", highlight: "大阪駅直結・新幹線アクセスに最適" },
    { name: "Cross Hotel Osaka", area: "心斎橋", tier: "ハイクラス", highlight: "道頓堀徒歩圏・グルメと観光のハブ" },
    { name: "Hotel Hankyu RESPIRE OSAKA", area: "梅田", tier: "ミドル", highlight: "新規開業・スタイリッシュ・コスパ良" },
  ],
  sapporo: [
    { name: "JR Tower Hotel Nikko Sapporo", area: "札幌駅", tier: "ハイクラス", highlight: "JR札幌駅直結・最上階展望大浴場" },
    { name: "Cross Hotel Sapporo", area: "札幌駅南", tier: "ハイクラス", highlight: "デザインホテル・天然温泉" },
    { name: "Premier Hotel Tsubaki Sapporo", area: "中島公園", tier: "ハイクラス", highlight: "札幌ドーム・繁華街への中間立地" },
    { name: "Hotel Mystays Sapporo Aspen", area: "札幌駅北", tier: "ミドル", highlight: "札幌駅徒歩2分・コスパ抜群" },
  ],
  fukuoka: [
    { name: "The Ritz-Carlton, Fukuoka", area: "天神", tier: "ラグジュアリー", highlight: "天神中心・福岡最高峰のサービス" },
    { name: "Grand Hyatt Fukuoka", area: "博多", tier: "ハイクラス", highlight: "博多駅・キャナルシティ徒歩圏" },
    { name: "Hotel Nikko Fukuoka", area: "博多", tier: "ハイクラス", highlight: "博多駅徒歩3分・ビジネス・観光どちらも" },
    { name: "Dormy Inn PREMIUM Hakata", area: "博多", tier: "ミドル", highlight: "天然温泉大浴場・夜鳴きそばが名物" },
  ],
  okinawa: [
    { name: "The Ritz-Carlton, Okinawa", area: "名護", tier: "ラグジュアリー", highlight: "ゴルフコース併設・名護湾の絶景" },
    { name: "Halekulani Okinawa", area: "恩納村", tier: "ラグジュアリー", highlight: "ハワイ発祥ブランド・プライベートビーチ" },
    { name: "Hyatt Regency Naha", area: "那覇国際通り", tier: "ハイクラス", highlight: "国際通り・観光拠点に最適" },
    { name: "Hotel Collective", area: "那覇国際通り", tier: "ハイクラス", highlight: "那覇中心・空港アクセスも良好" },
    { name: "Daiwa Roynet Hotel Naha-Omoromachi", area: "那覇おもろまち", tier: "ミドル", highlight: "DFSギャラリア徒歩圏・コスパ良" },
  ],
  hiroshima: [
    { name: "Sheraton Grand Hiroshima Hotel", area: "広島駅", tier: "ハイクラス", highlight: "広島駅直結・最上階クラブラウンジ" },
    { name: "Rihga Royal Hotel Hiroshima", area: "中心部", tier: "ハイクラス", highlight: "平和記念公園徒歩圏・老舗ホテル" },
    { name: "Hotel Granvia Hiroshima", area: "広島駅", tier: "ハイクラス", highlight: "JR広島駅直結・新幹線アクセス完璧" },
    { name: "Dormy Inn Hiroshima", area: "繁華街", tier: "ミドル", highlight: "天然温泉・夜鳴きそば" },
  ],
  nagoya: [
    { name: "Nagoya Marriott Associa Hotel", area: "名古屋駅", tier: "ハイクラス", highlight: "JR名古屋駅直結・JRセントラルタワーズ最上層" },
    { name: "The Strings Hotel Nagoya", area: "名古屋駅", tier: "ハイクラス", highlight: "ささしま・ノリタケの森エリア" },
    { name: "Hilton Nagoya", area: "栄", tier: "ハイクラス", highlight: "ビジネス街・栄の中心" },
    { name: "Daiwa Roynet Hotel Nagoya Eki-mae", area: "名古屋駅", tier: "ミドル", highlight: "駅前・出張に最適" },
  ],
  sendai: [
    { name: "The Westin Sendai", area: "仙台駅東", tier: "ラグジュアリー", highlight: "仙台最高層・パークタワー最上階に位置" },
    { name: "Hotel Metropolitan Sendai", area: "仙台駅", tier: "ハイクラス", highlight: "JR仙台駅直結・新幹線アクセス完璧" },
    { name: "Hotel Vista Sendai", area: "仙台駅", tier: "ミドル", highlight: "駅前・コスパ良" },
  ],
  bangkok: [
    { name: "Mandarin Oriental Bangkok", area: "リバーサイド", tier: "ラグジュアリー", highlight: "世界的名門・チャオプラヤー川沿いの歴史あるホテル" },
    { name: "The Peninsula Bangkok", area: "リバーサイド", tier: "ラグジュアリー", highlight: "川向こうの静謐な高級ホテル・無料船で繁華街へ" },
    { name: "Centara Grand at CentralWorld", area: "ラチャダムリ", tier: "ハイクラス", highlight: "CentralWorld直結・買物の中心" },
    { name: "Aloft Bangkok Sukhumvit 11", area: "スクンビット", tier: "ミドル", highlight: "夜遊び中心地・若年層に人気" },
    { name: "Ibis Styles Bangkok Khaosan Viengtai", area: "カオサン", tier: "バジェット", highlight: "バックパッカー街・コスパ最強" },
  ],
  seoul: [
    { name: "Lotte Hotel Seoul", area: "明洞", tier: "ラグジュアリー", highlight: "明洞徒歩圏・老舗ラグジュアリー" },
    { name: "Four Seasons Hotel Seoul", area: "光化門", tier: "ラグジュアリー", highlight: "景福宮徒歩圏・モダンラグジュアリー" },
    { name: "JW Marriott Dongdaemun Square Seoul", area: "東大門", tier: "ハイクラス", highlight: "DDP徒歩・夜のファッション街" },
    { name: "L'Escape Hotel", area: "明洞", tier: "ハイクラス", highlight: "ブティック型・パリ風デザイン" },
    { name: "ENA Suite Hotel Namdaemun", area: "明洞", tier: "ミドル", highlight: "明洞徒歩・南大門市場至近" },
  ],
  taipei: [
    { name: "Mandarin Oriental Taipei", area: "中山", tier: "ラグジュアリー", highlight: "屋外プール・ミシュラン星付きレストラン" },
    { name: "W Taipei", area: "信義", tier: "ラグジュアリー", highlight: "台北101徒歩圏・モダン" },
    { name: "Caesar Park Hotel Taipei", area: "台北駅", tier: "ハイクラス", highlight: "MRT台北駅直結・空港リムジン乗り場前" },
    { name: "Hotel COZZI Minsheng Taipei", area: "中山", tier: "ミドル", highlight: "繁華街・コスパ良" },
    { name: "Cho Hotel", area: "西門", tier: "ミドル", highlight: "西門町徒歩・夜市散策に便利" },
  ],
  singapore: [
    { name: "Marina Bay Sands", area: "マリーナベイ", tier: "ラグジュアリー", highlight: "屋上インフィニティプール・シンガポールの象徴" },
    { name: "Raffles Singapore", area: "シティホール", tier: "ラグジュアリー", highlight: "シンガポールスリングの発祥地・コロニアル建築" },
    { name: "Hotel Indigo Singapore Katong", area: "カトン", tier: "ハイクラス", highlight: "プラナカン文化エリアのブティックホテル" },
    { name: "Park Hotel Clarke Quay", area: "クラークキー", tier: "ハイクラス", highlight: "クラークキー川沿い・夜遊び拠点" },
    { name: "Hotel 81 Bencoolen", area: "ブギス", tier: "バジェット", highlight: "MRT近・コスパ重視" },
  ],
  "hong-kong": [
    { name: "The Peninsula Hong Kong", area: "尖沙咀", tier: "ラグジュアリー", highlight: "アジアを代表する名門・ロールスロイス送迎" },
    { name: "Mandarin Oriental Hong Kong", area: "中環", tier: "ラグジュアリー", highlight: "中環ビジネスエリア中心" },
    { name: "Cordis, Hong Kong", area: "モンコック", tier: "ハイクラス", highlight: "MTRモンコック駅直結・夜市散策に便利" },
    { name: "Mini Hotel Central", area: "中環", tier: "ミドル", highlight: "中環中心・モダンデザイン" },
  ],
  hanoi: [
    { name: "Sofitel Legend Metropole Hanoi", area: "旧市街", tier: "ラグジュアリー", highlight: "ハノイ最高峰の歴史的名門・1901年開業" },
    { name: "Hotel de l'Opera Hanoi", area: "オペラハウス周辺", tier: "ハイクラス", highlight: "オペラハウス徒歩・MGalleryブランド" },
    { name: "La Siesta Premium Hang Be", area: "旧市街", tier: "ハイクラス", highlight: "ブティック型・絶賛のホスピタリティ" },
    { name: "Hanoi Imperial Hotel", area: "旧市街", tier: "ミドル", highlight: "旧市街中心・観光徒歩圏" },
  ],
  "ho-chi-minh-city": [
    { name: "The Reverie Saigon", area: "1区", tier: "ラグジュアリー", highlight: "イタリアンデザインのオペラハウス徒歩圏" },
    { name: "Park Hyatt Saigon", area: "1区", tier: "ラグジュアリー", highlight: "オペラハウス前・コロニアル建築" },
    { name: "Sherwood Suites", area: "1区", tier: "ハイクラス", highlight: "アパートメント型・長期滞在に良い" },
    { name: "Liberty Central Saigon Riverside Hotel", area: "1区", tier: "ミドル", highlight: "サイゴン川沿い・コスパ良" },
  ],
  shanghai: [
    { name: "The Peninsula Shanghai", area: "外灘", tier: "ラグジュアリー", highlight: "外灘北端・浦東の夜景一望" },
    { name: "Waldorf Astoria Shanghai on the Bund", area: "外灘", tier: "ラグジュアリー", highlight: "歴史建築 The Bund Club 内・象徴的なホテル" },
    { name: "Park Hyatt Shanghai", area: "陸家嘴", tier: "ラグジュアリー", highlight: "上海環球金融中心79-93F・世界最高峰のホテル" },
    { name: "Jin Jiang Hotel Shanghai", area: "新天地", tier: "ハイクラス", highlight: "新天地徒歩・買物に便利" },
  ],
  manila: [
    { name: "The Peninsula Manila", area: "マカティ", tier: "ラグジュアリー", highlight: "マカティ中心・ビジネス・観光どちらにも" },
    { name: "Manila Marriott Hotel", area: "パサイ", tier: "ハイクラス", highlight: "空港至近・カジノ隣接" },
    { name: "Sofitel Philippine Plaza Manila", area: "パサイ", tier: "ハイクラス", highlight: "マニラ湾サンセット・ベイビュー" },
    { name: "Red Planet Manila Mabini", area: "エルミタ", tier: "ミドル", highlight: "観光地至近・コスパ重視" },
  ],
  paris: [
    { name: "The Ritz Paris", area: "ヴァンドーム広場", tier: "ラグジュアリー", highlight: "1898年開業・パリ最高峰の名門" },
    { name: "Hôtel Plaza Athénée", area: "シャンゼリゼ", tier: "ラグジュアリー", highlight: "ディオール本店至近・ファッショニスタ御用達" },
    { name: "Pullman Paris Tour Eiffel", area: "エッフェル塔", tier: "ハイクラス", highlight: "エッフェル塔徒歩2分・絶景" },
    { name: "Hotel Monge", area: "ラテン地区", tier: "ハイクラス", highlight: "ラテン地区・観光徒歩圏" },
    { name: "Hôtel des Grands Boulevards", area: "オペラ", tier: "ミドル", highlight: "ブティック・オペラ座エリア" },
  ],
  london: [
    { name: "The Savoy", area: "コヴェントガーデン", tier: "ラグジュアリー", highlight: "テムズ川沿い・1889年開業の名門" },
    { name: "The Langham, London", area: "リージェントストリート", tier: "ラグジュアリー", highlight: "BBC本社前・1865年開業" },
    { name: "ME London", area: "ストランド", tier: "ハイクラス", highlight: "シアター街徒歩圏・モダン" },
    { name: "Premier Inn London City (Tower Hill)", area: "シティ", tier: "ミドル", highlight: "タワーブリッジ徒歩・コスパ最強チェーン" },
  ],
  helsinki: [
    { name: "Hotel Kämp", area: "中心部", tier: "ラグジュアリー", highlight: "ヘルシンキ最高峰・1887年開業" },
    { name: "Clarion Hotel Helsinki", area: "イェトカサーリ", tier: "ハイクラス", highlight: "屋上スカイバー・港湾景観" },
    { name: "Scandic Park Helsinki", area: "中心部", tier: "ハイクラス", highlight: "公園隣接・中央駅徒歩圏" },
    { name: "Hotel F6", area: "中心部", tier: "ミドル", highlight: "ブティック・カフェ街エリア" },
  ],
  rome: [
    { name: "Hotel de Russie", area: "スペイン階段", tier: "ラグジュアリー", highlight: "ピンチョの丘・セレブリティに愛される" },
    { name: "Hotel Splendide Royal", area: "ヴェネト通り", tier: "ラグジュアリー", highlight: "ヴィッラ・ボルゲーゼ徒歩圏" },
    { name: "Hotel Artemide", area: "テルミニ", tier: "ハイクラス", highlight: "テルミニ駅徒歩・観光ベース" },
    { name: "Hotel Indigo Rome - St. George", area: "ナヴォーナ広場", tier: "ハイクラス", highlight: "歴史地区中心" },
  ],
  barcelona: [
    { name: "Hotel Arts Barcelona", area: "ベイ", tier: "ラグジュアリー", highlight: "海沿い高層・サグラダファミリア見える" },
    { name: "Mandarin Oriental Barcelona", area: "パセオ・デ・グラシア", tier: "ラグジュアリー", highlight: "ショッピング街中心" },
    { name: "Hotel Casa Camper", area: "ラバル", tier: "ハイクラス", highlight: "ブティック・カンペル創業者プロデュース" },
    { name: "Generator Barcelona", area: "グラシア", tier: "バジェット", highlight: "デザイナーズホステル・若者に人気" },
  ],
  "new-york": [
    { name: "The Plaza", area: "5番街", tier: "ラグジュアリー", highlight: "セントラルパーク前・映画の舞台" },
    { name: "The St. Regis New York", area: "ミッドタウン", tier: "ラグジュアリー", highlight: "ブラッディ・マリー発祥のホテル" },
    { name: "The Standard, High Line", area: "ミートパッキング", tier: "ハイクラス", highlight: "ハイラインを跨ぐデザインホテル" },
    { name: "citizenM New York Times Square", area: "タイムズスクエア", tier: "ハイクラス", highlight: "モダン・コスパ良" },
    { name: "Pod 51 Hotel", area: "ミッドタウン東", tier: "ミドル", highlight: "コンパクト客室・NY中心立地" },
  ],
  "los-angeles": [
    { name: "The Beverly Hills Hotel", area: "ビバリーヒルズ", tier: "ラグジュアリー", highlight: "ピンクパレスの愛称・セレブリティ御用達" },
    { name: "Shutters on the Beach", area: "サンタモニカ", tier: "ラグジュアリー", highlight: "ビーチフロント・西海岸の象徴" },
    { name: "The Hollywood Roosevelt", area: "ハリウッド", tier: "ハイクラス", highlight: "第1回アカデミー賞会場・歴史" },
    { name: "Freehand Los Angeles", area: "ダウンタウン", tier: "ミドル", highlight: "デザイン×ホステルのハイブリッド" },
  ],
  honolulu: [
    { name: "Halekulani", area: "ワイキキ", tier: "ラグジュアリー", highlight: "ハワイ最高峰の老舗・「天国にふさわしい館」の名" },
    { name: "The Royal Hawaiian, a Luxury Collection Resort", area: "ワイキキ", tier: "ラグジュアリー", highlight: "ピンクパレス・1927年開業" },
    { name: "Sheraton Waikiki", area: "ワイキキ", tier: "ハイクラス", highlight: "ビーチフロント・大型リゾート" },
    { name: "Aston Waikiki Sunset", area: "ワイキキ", tier: "ハイクラス", highlight: "コンドミニアム型・家族向け" },
    { name: "Ohia Waikiki Studio Suites", area: "ワイキキ", tier: "ミドル", highlight: "コスパ重視・キッチン付き" },
  ],
  dubai: [
    { name: "Burj Al Arab Jumeirah", area: "ジュメイラ", tier: "ラグジュアリー", highlight: "7つ星の称号・ドバイのシンボル" },
    { name: "Atlantis, The Palm", area: "パーム・ジュメイラ", tier: "ラグジュアリー", highlight: "水族館・ウォーターパーク併設" },
    { name: "Address Downtown", area: "ダウンタウン", tier: "ラグジュアリー", highlight: "ブルジュ・ハリファ正面" },
    { name: "Rove Downtown", area: "ダウンタウン", tier: "ミドル", highlight: "モダン・コスパ良・若年層向け" },
  ],
  sydney: [
    { name: "Park Hyatt Sydney", area: "ザ・ロックス", tier: "ラグジュアリー", highlight: "オペラハウス正面の絶景" },
    { name: "Four Seasons Hotel Sydney", area: "CBD", tier: "ラグジュアリー", highlight: "オペラハウス・ハーバーブリッジ見える" },
    { name: "QT Sydney", area: "CBD", tier: "ハイクラス", highlight: "歴史建築×モダン・デザイナーズ" },
    { name: "Adge Hotel", area: "サリーヒルズ", tier: "ハイクラス", highlight: "ブティック・トレンドエリア" },
  ],
  auckland: [
    { name: "Hotel Britomart", area: "ブリトマート", tier: "ラグジュアリー", highlight: "5つ星エコホテル・港エリア" },
    { name: "SO/ Auckland", area: "CBD", tier: "ラグジュアリー", highlight: "デザインホテル・港湾景観" },
    { name: "QT Auckland", area: "プリンセス・ワーフ", tier: "ハイクラス", highlight: "ヴィアダクトハーバー・ブティック" },
    { name: "Naumi Auckland Airport", area: "空港", tier: "ハイクラス", highlight: "空港5分・トランジット最適" },
  ],
  guam: [
    { name: "Hyatt Regency Guam", area: "タモン", tier: "ハイクラス", highlight: "タモン湾ビーチフロント・大型プール" },
    { name: "The Tsubaki Tower", area: "タモン", tier: "ラグジュアリー", highlight: "新規開業・タモンの最高峰" },
    { name: "Hilton Guam Resort & Spa", area: "タモン湾", tier: "ハイクラス", highlight: "プライベートビーチ・スパ" },
    { name: "Holiday Resort & Spa Guam", area: "タモン", tier: "ミドル", highlight: "コスパ良・ファミリー向け" },
  ],
};

export function getCuratedHotels(slug: string): CuratedHotel[] {
  return CURATED_HOTELS[slug] ?? [];
}
