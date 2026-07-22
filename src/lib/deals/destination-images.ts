/**
 * 目的地コード → Unsplash画像 マッピング
 * スクレイパーが取得したデータに画像がない場合のフォールバック
 */
const DESTINATION_IMAGES: Record<string, string> = {
  // 国際線 — アジア
  BKK: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80",
  TPE: "https://images.unsplash.com/photo-1470004914212-05527e49370b?w=800&q=80",
  ICN: "https://images.unsplash.com/photo-1534274867514-d5b47ef89ed7?w=800&q=80",
  SIN: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80",
  HKG: "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=800&q=80",
  MNL: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&q=80",
  SGN: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80",
  HAN: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80",
  PVG: "https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=800&q=80",
  PEK: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80",
  DXB: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
  DEL: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
  BOM: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80",
  KUL: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80",
  BKI: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80",
  DPS: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
  PUS: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Skyline_of_Busan_Including_Gwangan_Bridge%2C_Marine_City_and_LCT_Skyscrapers.jpg/960px-Skyline_of_Busan_Including_Gwangan_Bridge%2C_Marine_City_and_LCT_Skyscrapers.jpg", // 釜山: 広安大橋とマリンシティ (旧URLは404だった)
  // TP 最安値ウォッチが日常的に返す国内都市。フォールバックの汎用写真ではなく
  // 実際の街の写真を出す (2026-07-17 目視検品済み)。
  AXT: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Skyline_of_Akita_City_20200328.jpg/960px-Skyline_of_Akita_City_20200328.jpg", // 秋田駅前
  OKJ: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Okayama_Castle%2C_November_2016_-02.jpg/960px-Okayama_Castle%2C_November_2016_-02.jpg", // 岡山城と紅葉
  TOY: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/View_of_Toyama_Castle_from_Toyama_City_Hall.jpg/960px-View_of_Toyama_Castle_from_Toyama_City_Hall.jpg", // 富山城と市街
  CEB: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&q=80",
  PKX: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80",
  KHH: "https://images.unsplash.com/photo-1470004914212-05527e49370b?w=800&q=80",
  CJU: "https://images.unsplash.com/photo-1534274867514-d5b47ef89ed7?w=800&q=80",

  // 国際線 — ヨーロッパ
  CDG: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
  LHR: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
  HEL: "https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?w=800&q=80",
  FCO: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
  BCN: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80",
  FRA: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80",
  AMS: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80",
  IST: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80",
  BER: "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&q=80",
  VIE: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&q=80",
  PRG: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&q=80",
  MUC: "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=800&q=80",
  MAD: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&q=80",
  ATH: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80",

  // 国際線 — 北米
  JFK: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80",
  LAX: "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=800&q=80",
  SFO: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80",
  ORD: "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=800&q=80",
  YVR: "https://images.unsplash.com/photo-1559511260-66a654ae982a?w=800&q=80",

  // 国際線 — オセアニア
  SYD: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80",
  HNL: "https://images.unsplash.com/photo-1507876466758-bc54f384809c?w=800&q=80",
  AKL: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&q=80",
  GUM: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",

  // 国内線 — Wikipedia の都市代表画像（編集者キュレートで都市と確実に一致）
  CTS: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/SapporoCity_Skylines2020.jpg/1280px-SapporoCity_Skylines2020.jpg",
  OKD: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/SapporoCity_Skylines2020.jpg/1280px-SapporoCity_Skylines2020.jpg",
  OKA: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Naha_montage.jpg/960px-Naha_montage.jpg",
  FUK: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Fukuoka_Skyline_of_Seaside_Momochi.jpg/960px-Fukuoka_Skyline_of_Seaside_Momochi.jpg",
  KIX: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Osaka_Castle_02bs3200.jpg/1280px-Osaka_Castle_02bs3200.jpg",
  ITM: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Osaka_Castle_02bs3200.jpg/1280px-Osaka_Castle_02bs3200.jpg",
  UKB: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Osaka_Castle_02bs3200.jpg/1280px-Osaka_Castle_02bs3200.jpg",
  NGO: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Nagoya_Station_-_View_from_the_Main_Building_in_Nagoya_Campus_of_Aichi_University_2022-6-29.jpg/1280px-Nagoya_Station_-_View_from_the_Main_Building_in_Nagoya_Campus_of_Aichi_University_2022-6-29.jpg",
  HIJ: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Atomic_Bomb_Dome_and_Motoyaso_River%2C_Hiroshima%2C_Northwest_view_20190417_1.jpg/1280px-Atomic_Bomb_Dome_and_Motoyaso_River%2C_Hiroshima%2C_Northwest_view_20190417_1.jpg",
  KOJ: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Kagoshima_Montage.jpg/960px-Kagoshima_Montage.jpg",
  SDJ: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/SendaiCity_Skylines_from_Mukaiyama2018.jpg/1280px-SendaiCity_Skylines_from_Mukaiyama2018.jpg",
  KMJ: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Mount_Tatsuda-yama_%28Kumamoto%29_1.jpg/960px-Mount_Tatsuda-yama_%28Kumamoto%29_1.jpg",
  NGS: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Nagasaki_City_View_from_Glover_Garden%2C_Nagasaki_2014.jpg/960px-Nagasaki_City_View_from_Glover_Garden%2C_Nagasaki_2014.jpg",
  AOJ: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Aomori_Montage.jpg/960px-Aomori_Montage.jpg",
  HKD: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Hakodate-panorama.jpg/1280px-Hakodate-panorama.jpg", // 函館山 夜景 (旧: Hakodate_montage はコラージュで枠に別画像が割り込んで見えた)
  MYJ: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Matsuyama_montage.jpg/960px-Matsuyama_montage.jpg",
  KCZ: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Kochi_montage.jpg/960px-Kochi_montage.jpg",

  // ── TP 最安値ウォッチのロングテール 132都市 (2026-07-18 追加) ──
  // 掲載190行き先のうち135件が汎用フォールバックに落ちていたため一括で埋めた。
  // 出所は Wikipedia の記事代表画像 (編集者キュレートなので被写体が一致する)。
  // **全132枚をブラウザで実際に描画して目視検品済み**。自治体記事は代表画像が
  // 地図・国旗・紋章になることが多く、22件が実際にそうだったため英語版から取り直し、
  // それでも駄目だった12件 (奄美/ボラカイ/ダバオ/対馬/種子島/隠岐 等) は記事内の
  // 写真から1枚ずつ手で選び直した。**URLを足すときは必ず画像を目視すること**
  // (ファイル名やAPIの戻り値だけを根拠にしない。過去に地図・カメラ写真の事故あり)。
  AER: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Sochi_adler_aerial_view_2018_20.jpg/1280px-Sochi_adler_aerial_view_2018_20.jpg", // ソチ
  AKJ: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Asahikawa_Montage.jpg", // 旭川
  ALA: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/13_%D0%92%D0%B8%D0%B4_%D0%BD%D0%B0_%D0%90%D0%BB%D0%BC%D0%B0-%D0%90%D1%82%D1%83_%D1%81_%D0%B3%D0%BE%D1%80%D1%8B_%D0%9A%D0%BE%D0%BA_%D0%A2%D1%8E%D0%B1%D0%B5.jpg/1280px-13_%D0%92%D0%B8%D0%B4_%D0%BD%D0%B0_%D0%90%D0%BB%D0%BC%D0%B0-%D0%90%D1%82%D1%83_%D1%81_%D0%B3%D0%BE%D1%80%D1%8B_%D0%9A%D0%BE%D0%BA_%D0%A2%D1%8E%D0%B1%D0%B5.jpg", // アルマトイ
  ASJ: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Kinsakubaru_wildwood.jpg/1280px-Kinsakubaru_wildwood.jpg", // 奄美
  ATL: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Montage_Atlanta.jpg", // アトランタ
  AUH: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Abu_dhabi_skylines_2014.jpg/1280px-Abu_dhabi_skylines_2014.jpg", // アブダビ
  AYT: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Yivli_Minaret_Mosque_Antalya.jpg/1280px-Yivli_Minaret_Mosque_Antalya.jpg", // アンタルヤ
  BAK: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Baku_Montage.jpg/1280px-Baku_Montage.jpg", // バクー
  BDS: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Le_colonne_della_Via_Appia_a_Brindisi.jpg/1280px-Le_colonne_della_Via_Appia_a_Brindisi.jpg", // ブリンディジ
  BEG: "https://upload.wikimedia.org/wikipedia/commons/8/88/Belgrade_panorama.jpg", // ベオグラード
  BLQ: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Collage_Bologna.jpg/1280px-Collage_Bologna.jpg", // ボローニャ
  BOS: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Boston_Montage.jpg/1280px-Boston_Montage.jpg", // ボストン
  BQS: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Triumphal_arch_in_Blagoveshchensk_2015-11_1448449848.jpg/1280px-Triumphal_arch_in_Blagoveshchensk_2015-11_1448449848.jpg", // ブラゴヴェシチェンスク
  BRI: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Puglia_bari_old-town.jpg/1280px-Puglia_bari_old-town.jpg", // バーリ
  BRU: "https://upload.wikimedia.org/wikipedia/commons/c/c6/TE-Collage_Brussels.png", // ブリュッセル
  BSZ: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Bishkek_City%27s_business_center.jpg/1280px-Bishkek_City%27s_business_center.jpg", // ビシュケク
  BUD: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Chain_Bridge%2C_west_side%2C_2015_Budapest_-_panoramio_%2891%29.jpg/1280px-Chain_Bridge%2C_west_side%2C_2015_Budapest_-_panoramio_%2891%29.jpg", // ブダペスト
  BUH: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Bucharest-Skyline-01.jpg/1280px-Bucharest-Skyline-01.jpg", // ブカレスト
  BUS: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Batumi_sunset_2.jpg/1280px-Batumi_sunset_2.jpg", // バトゥミ
  CAN: "https://upload.wikimedia.org/wikipedia/commons/d/df/Guangzhou_montage.jpg", // 広州
  CEI: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/%E0%B8%AB%E0%B8%AD%E0%B8%99%E0%B8%B2%E0%B8%AC%E0%B8%B4%E0%B8%81%E0%B8%B2%E0%B9%80%E0%B8%8A%E0%B8%B5%E0%B8%A2%E0%B8%87%E0%B8%A3%E0%B8%B2%E0%B8%A2_Chiang_Rai_Clock_Tower.jpg/1280px-%E0%B8%AB%E0%B8%AD%E0%B8%99%E0%B8%B2%E0%B8%AC%E0%B8%B4%E0%B8%81%E0%B8%B2%E0%B9%80%E0%B8%8A%E0%B8%B5%E0%B8%A2%E0%B8%87%E0%B8%A3%E0%B8%B2%E0%B8%A2_Chiang_Rai_Clock_Tower.jpg", // チェンライ
  CEK: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/%D0%A4%D0%BE%D1%82%D0%BE%D0%B3%D1%80%D0%B0%D1%84%D0%B8%D1%8F_%D0%A7%D0%B5%D0%BB%D1%8F%D0%B1%D0%B8%D0%BD%D1%81%D0%BA%D0%B0_%D1%81_%D0%BE%D1%82%D1%80%D0%B0%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5%D0%BC_%282021%29.jpg/1280px-%D0%A4%D0%BE%D1%82%D0%BE%D0%B3%D1%80%D0%B0%D1%84%D0%B8%D1%8F_%D0%A7%D0%B5%D0%BB%D1%8F%D0%B1%D0%B8%D0%BD%D1%81%D0%BA%D0%B0_%D1%81_%D0%BE%D1%82%D1%80%D0%B0%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5%D0%BC_%282021%29.jpg", // チェリャビンスク
  CGO: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Zhengzhou_photos.png", // 鄭州
  CGQ: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/%E9%81%A5%E6%9C%9B%E5%8D%97%E6%B9%96%E5%8C%97%E5%B2%B8_nan_hu_-_panoramio.jpg/1280px-%E9%81%A5%E6%9C%9B%E5%8D%97%E6%B9%96%E5%8C%97%E5%B2%B8_nan_hu_-_panoramio.jpg", // 長春
  CHI: "https://upload.wikimedia.org/wikipedia/commons/7/77/Chicago_montage.jpg", // シカゴ
  CJJ: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Cheongju_Sangdangsangseong.jpg/1280px-Cheongju_Sangdangsangseong.jpg", // 清州
  CKG: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Chongqing_Nightscape.jpg/1280px-Chongqing_Nightscape.jpg", // 重慶
  CMB: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Colombo_city_skyline_at_night.png/1280px-Colombo_city_skyline_at_night.png", // コロンボ
  CMN: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Casablanca_-_Morocco_008.jpg", // カサブランカ
  CNX: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/ChiangMaiMoat.jpg/1280px-ChiangMaiMoat.jpg", // チェンマイ
  CTU: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/%E9%9B%AA%E5%B1%B1%E4%B8%8B%E7%9A%84%E6%88%90%E9%83%BD%E5%B8%82%E5%A4%A9%E9%99%85%E7%BA%BF_Chengdu_skyline_with_snow_capped_mountains.jpg/1280px-%E9%9B%AA%E5%B1%B1%E4%B8%8B%E7%9A%84%E6%88%90%E9%83%BD%E5%B8%82%E5%A4%A9%E9%99%85%E7%BA%BF_Chengdu_skyline_with_snow_capped_mountains.jpg", // 成都
  DAC: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Tejgaon_Commercial_Area.jpg/1280px-Tejgaon_Commercial_Area.jpg", // ダッカ
  DAD: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Han_River_Bridge_in_Vietnam_Night_View.jpg/1280px-Han_River_Bridge_in_Vietnam_Night_View.jpg", // ダナン
  DLC: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Dalian_Montage_%282%29.jpg/1280px-Dalian_Montage_%282%29.jpg", // 大連
  DVO: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Bolton_Street%2C_Davao_City.jpg/1280px-Bolton_Street%2C_Davao_City.jpg", // ダバオ
  DYU: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Dushanbe_panorama_05.jpg/1280px-Dushanbe_panorama_05.jpg", // ドゥシャンベ
  EVN: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Yerevan_coll._2015.jpg/1280px-Yerevan_coll._2015.jpg", // エレバン
  FLR: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Collage_Firenze.jpg/1280px-Collage_Firenze.jpg", // フィレンツェ
  FOC: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Fuzhou_Taixi_CBD.jpg", // 福州
  FSZ: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Higashi-Shizuoka_Panorama_02.jpg/1280px-Higashi-Shizuoka_Panorama_02.jpg", // 静岡
  GVA: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Views_of_Geneva.jpg/1280px-Views_of_Geneva.jpg", // ジュネーブ
  HEK: "https://upload.wikimedia.org/wikipedia/commons/b/be/Heilongjiang_%28Amur%29_shore.jpg", // 黒河
  HGH: "https://upload.wikimedia.org/wikipedia/commons/5/55/Hangzhou_montage.png", // 杭州
  HIA: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/%E6%B7%AE%E5%AE%89%E5%BA%9C%E5%A4%A7%E5%A0%82.JPG/1280px-%E6%B7%AE%E5%AE%89%E5%BA%9C%E5%A4%A7%E5%A0%82.JPG", // 淮安
  HKT: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Phuket_Aerial.jpg/1280px-Phuket_Aerial.jpg", // プーケット
  HNA: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/%E8%8A%B1%E5%B7%BB%E6%B8%A9%E6%B3%89_%E3%83%90%E3%83%A9%E5%9C%92%E3%81%A8%E3%83%9B%E3%83%86%E3%83%AB3%E9%A4%A8.jpg/1280px-%E8%8A%B1%E5%B7%BB%E6%B8%A9%E6%B3%89_%E3%83%90%E3%83%A9%E5%9C%92%E3%81%A8%E3%83%9B%E3%83%86%E3%83%AB3%E9%A4%A8.jpg", // 花巻
  HOU: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Houston_montage.jpg/1280px-Houston_montage.jpg", // ヒューストン
  HRB: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Harbin_Montage.JPG", // ハルビン
  HTA: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/%D0%9A%D0%BE%D0%BB%D0%BB%D0%B0%D0%B6_%D0%A7%D0%B8%D1%82%D0%B0.jpg/1280px-%D0%9A%D0%BE%D0%BB%D0%BB%D0%B0%D0%B6_%D0%A7%D0%B8%D1%82%D0%B0.jpg", // チタ
  IAO: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Picturesque_Guyam_Island%2C_Siargao.jpg/1280px-Picturesque_Guyam_Island%2C_Siargao.jpg", // シアルガオ
  IKT: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Irkutsk_Collage.png", // イルクーツク
  ISG: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Macchu_picchu03.jpg", // 石垣
  JED: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Jeddah_Waterfront_2025.jpg", // ジッダ
  JKT: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Bundaran_Hotel_Indonesia_%282025%29.jpg/1280px-Bundaran_Hotel_Indonesia_%282025%29.jpg", // ジャカルタ
  JNB: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Johannesburg_skyline_2017.jpg/1280px-Johannesburg_skyline_2017.jpg", // ヨハネスブルグ
  JOG: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Kraton_Yogyakarta_Pagelaran.jpg/1280px-Kraton_Yogyakarta_Pagelaran.jpg", // ジョグジャカルタ
  KBV: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Shell_Cemetery%2C_Krabi%2C_Thailand_SF0001.jpg/1280px-Shell_Cemetery%2C_Krabi%2C_Thailand_SF0001.jpg", // クラビ
  KHV: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/%D0%A3%D1%81%D1%81%D1%83%D1%80%D0%B8%D0%B9%D1%81%D0%BA%D0%B8%D0%B9_%D0%B1%D1%83%D0%BB%D1%8C%D0%B2%D0%B0%D1%80.jpg/1280px-%D0%A3%D1%81%D1%81%D1%83%D1%80%D0%B8%D0%B9%D1%81%D0%BA%D0%B8%D0%B9_%D0%B1%D1%83%D0%BB%D1%8C%D0%B2%D0%B0%D1%80.jpg", // ハバロフスク
  KIJ: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Niigata_Montage3.png/1280px-Niigata_Montage3.png", // 新潟
  KJA: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D0%BE%D1%8F%D1%80%D1%81%D0%BA_%D0%A1%D1%82%D1%80%D0%B5%D0%BB%D0%BA%D0%B0_%D1%81_%D0%B2%D1%8B%D1%81%D0%BE%D1%82%D1%8B.jpg/1280px-%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D0%BE%D1%8F%D1%80%D1%81%D0%BA_%D0%A1%D1%82%D1%80%D0%B5%D0%BB%D0%BA%D0%B0_%D1%81_%D0%B2%D1%8B%D1%81%D0%BE%D1%82%D1%8B.jpg", // クラスノヤルスク
  KMI: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Miyazaki_Montage.jpg", // 宮崎
  KMQ: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Natadera.jpg", // 小松
  KTM: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Kathmandu-Durbar_Square-06-Mahavishnu-Kuh-Vishnu-Pratapamalla-Jagannath-2007-gje.jpg/1280px-Kathmandu-Durbar_Square-06-Mahavishnu-Kuh-Vishnu-Pratapamalla-Jagannath-2007-gje.jpg", // カトマンズ
  KUH: "https://upload.wikimedia.org/wikipedia/commons/3/37/Kushiro_Montage.jpg", // 釧路
  KUM: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Ooko_Falls_03.jpg/1280px-Ooko_Falls_03.jpg", // 屋久島
  KWE: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/View_of_Guiyang%2C_Guizhou_from_Neighboring_Mountains.jpg/1280px-View_of_Guiyang%2C_Guizhou_from_Neighboring_Mountains.jpg", // 貴陽
  KZN: "https://upload.wikimedia.org/wikipedia/commons/5/52/KAZ_Collage_2015.png", // カザン
  LAS: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Las_Vegas_composite.png/1280px-Las_Vegas_composite.png", // ラスベガス
  LCA: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Palm_trees_promenade.JPG/1280px-Palm_trees_promenade.JPG", // ラルナカ
  LED: "https://upload.wikimedia.org/wikipedia/commons/f/f2/St._Petersburg_Montage_2016.png", // サンクトペテルブルク
  LGK: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Eagle_square_at_Kuah_Langkawi.jpg/1280px-Eagle_square_at_Kuah_Langkawi.jpg", // ランカウイ
  LOS: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Skywater.jpg/1280px-Skywater.jpg", // ラゴス
  MCT: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Downtown_Muscat_%288725487315%29.jpg/1280px-Downtown_Muscat_%288725487315%29.jpg", // マスカット
  MCX: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Dagestan_market.jpg/1280px-Dagestan_market.jpg", // マハチカラ
  MEL: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Melbourne_CBD_and_Ceremonial_Avenue_%28in_2024%29_as_seen_from_the_rooftop_of_Shrine_of_Remembrance.jpg/1280px-Melbourne_CBD_and_Ceremonial_Avenue_%28in_2024%29_as_seen_from_the_rooftop_of_Shrine_of_Remembrance.jpg", // メルボルン
  MES: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Medan.._Downtown.jpg/1280px-Medan.._Downtown.jpg", // メダン
  MFM: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Lago_Nam_Van%2C_Macao%2C_2013-08-08%2C_DD_05.jpg/1280px-Lago_Nam_Van%2C_Macao%2C_2013-08-08%2C_DD_05.jpg", // マカオ
  MIA: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Miami_collage_20110330.jpg", // マイアミ
  MLE: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Male-total.jpg/1280px-Male-total.jpg", // マレ
  MMY: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Miyako_maipama_1.jpg/1280px-Miyako_maipama_1.jpg", // 宮古
  MPH: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Boracay%2C_1985_%288758953461%29.jpg/1280px-Boracay%2C_1985_%288758953461%29.jpg", // ボラカイ
  MSQ: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Minsk_Montage_%282015%29.png", // ミンスク
  MXP: "https://upload.wikimedia.org/wikipedia/commons/5/58/Milan.Proper.Wikipedia.Image.png", // ミラノ
  NAN: "https://upload.wikimedia.org/wikipedia/commons/8/83/Nadi.jpg", // ナンディ
  NHA: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Nha_Trang%2C_Kh%C3%A1nh_H%C3%B2a.png/1280px-Nha_Trang%2C_Kh%C3%A1nh_H%C3%B2a.png", // ニャチャン
  NKG: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Nanjing_CBD_from_City_Wall.jpg/1280px-Nanjing_CBD_from_City_Wall.jpg", // 南京
  NQZ: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Trip_to_Astana_%282015-10-24%29_01.jpg/1280px-Trip_to_Astana_%282015-10-24%29_01.jpg", // アスタナ
  OAK: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/OAKLAND%2C_CA%2C_USA_-_Skyline_and_Bridge.JPG/1280px-OAKLAND%2C_CA%2C_USA_-_Skyline_and_Bridge.JPG", // オークランド
  OBO: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/131012_Obihiro_Airport_Hokkaido_Japan00s5.jpg/1280px-131012_Obihiro_Airport_Hokkaido_Japan00s5.jpg", // 帯広
  OIT: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/JR_Oita_station_%2C_JR_%E5%A4%A7%E5%88%86%E9%A7%85_-_panoramio_%281%29.jpg/1280px-JR_Oita_station_%2C_JR_%E5%A4%A7%E5%88%86%E9%A7%85_-_panoramio_%281%29.jpg", // 大分
  OKI: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Oki_SAIGO_KOUOOHASHI.JPG/1280px-Oki_SAIGO_KOUOOHASHI.JPG", // 隠岐
  OVB: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Novosibirsk_skyline_in_winter.jpg/1280px-Novosibirsk_skyline_in_winter.jpg", // ノボシビルスク
  PEN: "https://upload.wikimedia.org/wikipedia/commons/5/58/Cmglee_Penang_Second_Bridge_aerial2.jpg", // ペナン
  PER: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Perth_Montage.png", // パース
  PQC: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/DuongDong.jpg/1280px-DuongDong.jpg", // フーコック
  PVD: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Providence_Montage_Updated.jpg/1280px-Providence_Montage_Updated.jpg", // プロビデンス
  RGN: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Collage_of_Yangon.jpg/1280px-Collage_of_Yangon.jpg", // ヤンゴン
  RMO: "https://upload.wikimedia.org/wikipedia/commons/7/78/Dacia_Boulevard_%285822778292%29.jpg", // キシナウ
  RMQ: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Taichung_montage.PNG", // 台中
  RNJ: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Yoron_Island_20080622.jpg", // 与論
  RUH: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Riyadh%2C_Saudi_Arabia_%282048x1367%29_%2836864830374%29.jpg/1280px-Riyadh%2C_Saudi_Arabia_%282048x1367%29_%2836864830374%29.jpg", // リヤド
  SCL: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Santiago_de_chile_collage.png", // サンティアゴ
  SDK: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Sandakan.jpg/1280px-Sandakan.jpg", // サンダカン
  SHE: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/%E6%B2%88%E9%98%B3%E6%B5%91%E6%B2%B3%E5%A4%A7%E6%A1%A5%E5%A4%A9%E9%99%85%E7%BA%BF.jpg/1280px-%E6%B2%88%E9%98%B3%E6%B5%91%E6%B2%B3%E5%A4%A7%E6%A1%A5%E5%A4%A9%E9%99%85%E7%BA%BF.jpg", // 瀋陽
  SHJ: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Sharjah%2C_UAE.jpg/1280px-Sharjah%2C_UAE.jpg", // シャルジャ
  SHM: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Shirahama_montages.JPG", // 南紀白浜
  SJC: "https://upload.wikimedia.org/wikipedia/commons/1/1c/SanJose_Infobox_Pic_Montage.jpg", // サンノゼ
  SKD: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/RegistanSquare_Samarkand.jpg/1280px-RegistanSquare_Samarkand.jpg", // サマルカンド
  SLC: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Front_view_of_State_Capitol_Building.jpg/1280px-Front_view_of_State_Capitol_Building.jpg", // ソルトレイクシティ
  STR: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Neues_Schloss_Schlossplatzspringbrunnen_Schlossplatz_Stuttgart_2015_01.jpg/1280px-Neues_Schloss_Schlossplatzspringbrunnen_Schlossplatz_Stuttgart_2015_01.jpg", // シュトゥットガルト
  SVO: "https://upload.wikimedia.org/wikipedia/commons/2/24/MSK_Collage_2015.png", // モスクワ
  SVX: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Yekaterinburg-overview-april-2015-russia-0001.jpg/1280px-Yekaterinburg-overview-april-2015-russia-0001.jpg", // エカテリンブルク
  SYX: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Tianya_Haijiao_-_01.jpg/1280px-Tianya_Haijiao_-_01.jpg", // 三亜
  SZX: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Shenzhen_city_montage.png/1280px-Shenzhen_city_montage.png", // 深セン
  TAK: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Takamatsu_montage.png", // 高松
  TAO: "https://upload.wikimedia.org/wikipedia/commons/c/c6/Qingdao_new_montage.png", // 青島
  TAS: "https://upload.wikimedia.org/wikipedia/commons/3/33/Tashkent_skyline_2019.jpg", // タシケント
  TBS: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Tbilisi_collage.png/1280px-Tbilisi_collage.png", // トビリシ
  TNE: "https://upload.wikimedia.org/wikipedia/commons/5/53/H2A11001.jpg", // 種子島
  TSJ: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Miuda_Beach%2C_Tsushima_on_March_2nd%2C_2017.jpg/1280px-Miuda_Beach%2C_Tsushima_on_March_2nd%2C_2017.jpg", // 対馬
  TSN: "https://upload.wikimedia.org/wikipedia/commons/3/39/Tianjin_montage.jpg", // 天津
  UBN: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/UB_downtown.jpg/1280px-UB_downtown.jpg", // ウランバートル
  UFA: "https://upload.wikimedia.org/wikipedia/commons/1/17/Ufa01.jpg", // ウファ
  USM: "https://upload.wikimedia.org/wikipedia/commons/8/80/Koh_Samui_Lipa_Noi2.jpg", // サムイ
  UTP: "https://upload.wikimedia.org/wikipedia/commons/0/04/Montage_Pattaya.jpg", // パタヤ
  VLC: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Malvarrosa_Beach%2C_Valencia%2C_Spain_%2829812271043%29.jpg/1280px-Malvarrosa_Beach%2C_Valencia%2C_Spain_%2829812271043%29.jpg", // バレンシア
  VTE: "https://upload.wikimedia.org/wikipedia/en/thumb/2/28/Vientiane_-_Patuxai_-_0003.jpg/1280px-Vientiane_-_Patuxai_-_0003.jpg", // ビエンチャン
  VVO: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Center_of_Vladivostok_and_Zolotoy_Rog.jpg", // ウラジオストク
  WKJ: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Wakkanai_montage.jpg/1280px-Wakkanai_montage.jpg", // 稚内
  XMN: "https://upload.wikimedia.org/wikipedia/commons/8/89/Xiamen_montage.png", // 廈門
  YGJ: "https://upload.wikimedia.org/wikipedia/commons/8/80/Yonago_montage_2017.jpg", // 米子
  ZRH: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Bahnhofstrasse-2019.jpg/1280px-Bahnhofstrasse-2019.jpg", // チューリッヒ
  NRT: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Skyscrapers_of_Shinjuku_2009_January.jpg/1280px-Skyscrapers_of_Shinjuku_2009_January.jpg",
  HND: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Skyscrapers_of_Shinjuku_2009_January.jpg/1280px-Skyscrapers_of_Shinjuku_2009_January.jpg",
};

/**
 * 未登録の行き先コード用フォールバック画像プール。
 *
 * 特定都市を詐称しない「空・機窓・雲・地図」等の装飾的な汎用画像のみ
 * (景表法配慮: 「これは○○市の写真」と誤認させない)。コードごとに決定的に
 * 1枚を割り当てるので、登録外の多数の行き先でも "全部同じ画像" にならず
 * グリッドが自然に見える。
 */
const FALLBACK_POOL: string[] = [
  // 全7枚を 2026-07-17 に実画像を目視して検品済み。コメントは実際の被写体。
  // 過去にコメントと実画像がズレて「秋田・岡山のカードがカメラの写真」事故が
  // 起きたため、URL を追加・変更するときは必ず画像を目視してから入れること。
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80", // 機窓から夕日
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80", // 翼と雲
  "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=800&q=80", // 着陸する旅客機と滑走路
  "https://images.unsplash.com/photo-1542296332-2e4473faf563?w=800&q=80", // 空港駐機場と夕日
  "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?w=800&q=80", // 滝と旅人
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80", // 山並みと光
  "https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=800&q=80", // 翼と雲海
];

/** コード文字列の決定的ハッシュ (同じコードは常に同じ画像)。 */
function hashCode(code: string): number {
  let h = 0;
  for (let i = 0; i < code.length; i++) {
    h = (h * 31 + code.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getDestinationImage(code: string): string {
  const mapped = DESTINATION_IMAGES[code];
  if (mapped) return mapped;
  // 登録外: コードごとに固定の汎用画像を割り当て (全部同じを防ぐ)
  return FALLBACK_POOL[hashCode(code) % FALLBACK_POOL.length];
}

/**
 * 任意 seed で汎用プールから決定的に1枚選ぶ (記事カバーの重複回避などに使用)。
 * 都市を詐称しない装飾画像のみなので、どのコンテンツに使っても誤認を招かない。
 */
export function pickGenericCover(seed: string): string {
  return FALLBACK_POOL[hashCode(seed) % FALLBACK_POOL.length];
}
