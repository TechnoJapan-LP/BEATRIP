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
  OKA: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/111204_Naminoue_Beach_and_Naminoue-gu_Naha_Okinawa_pref_Japan03s3.jpg/1280px-111204_Naminoue_Beach_and_Naminoue-gu_Naha_Okinawa_pref_Japan03s3.jpg", // 那覇 (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  FUK: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Fukuoka_Skyline_of_Seaside_Momochi.jpg/960px-Fukuoka_Skyline_of_Seaside_Momochi.jpg",
  KIX: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Osaka_Castle_02bs3200.jpg/1280px-Osaka_Castle_02bs3200.jpg",
  ITM: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Osaka_Castle_02bs3200.jpg/1280px-Osaka_Castle_02bs3200.jpg",
  UKB: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Osaka_Castle_02bs3200.jpg/1280px-Osaka_Castle_02bs3200.jpg",
  NGO: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Nagoya_Station_-_View_from_the_Main_Building_in_Nagoya_Campus_of_Aichi_University_2022-6-29.jpg/1280px-Nagoya_Station_-_View_from_the_Main_Building_in_Nagoya_Campus_of_Aichi_University_2022-6-29.jpg",
  HIJ: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Atomic_Bomb_Dome_and_Motoyaso_River%2C_Hiroshima%2C_Northwest_view_20190417_1.jpg/1280px-Atomic_Bomb_Dome_and_Motoyaso_River%2C_Hiroshima%2C_Northwest_view_20190417_1.jpg",
  KOJ: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Goromon_Gate_ac_%281%29.jpg/1280px-Goromon_Gate_ac_%281%29.jpg", // 鹿児島 (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  SDJ: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/SendaiCity_Skylines_from_Mukaiyama2018.jpg/1280px-SendaiCity_Skylines_from_Mukaiyama2018.jpg",
  KMJ: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Mount_Tatsuda-yama_%28Kumamoto%29_1.jpg/960px-Mount_Tatsuda-yama_%28Kumamoto%29_1.jpg",
  NGS: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Nagasaki_City_View_from_Glover_Garden%2C_Nagasaki_2014.jpg/960px-Nagasaki_City_View_from_Glover_Garden%2C_Nagasaki_2014.jpg",
  AOJ: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/A-factory.JPG/1280px-A-factory.JPG", // 青森 (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  HKD: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Hakodate-panorama.jpg/1280px-Hakodate-panorama.jpg", // 函館山 夜景 (旧: Hakodate_montage はコラージュで枠に別画像が割り込んで見えた)
  MYJ: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Dogo_Onsen_Station_in_2010-9-6_No%2C1.JPG", // 松山 (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  KCZ: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/080228_Kagami_River_Kochi_Japan02s5.jpg/1280px-080228_Kagami_River_Kochi_Japan02s5.jpg", // 高知 (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)

  // ── TP 最安値ウォッチのロングテール 132都市 (2026-07-18 追加) ──
  // 掲載190行き先のうち135件が汎用フォールバックに落ちていたため一括で埋めた。
  // 出所は Wikipedia の記事代表画像 (編集者キュレートなので被写体が一致する)。
  // **全132枚をブラウザで実際に描画して目視検品済み**。自治体記事は代表画像が
  // 地図・国旗・紋章になることが多く、22件が実際にそうだったため英語版から取り直し、
  // それでも駄目だった12件 (奄美/ボラカイ/ダバオ/対馬/種子島/隠岐 等) は記事内の
  // 写真から1枚ずつ手で選び直した。**URLを足すときは必ず画像を目視すること**
  // (ファイル名やAPIの戻り値だけを根拠にしない。過去に地図・カメラ写真の事故あり)。
  AER: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Sochi_adler_aerial_view_2018_20.jpg/1280px-Sochi_adler_aerial_view_2018_20.jpg", // ソチ
  AKJ: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/140724_Asahikawa_Airport_Hokkaido_Japan01s3.JPG/1280px-140724_Asahikawa_Airport_Hokkaido_Japan01s3.JPG", // 旭川 (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  ALA: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/13_%D0%92%D0%B8%D0%B4_%D0%BD%D0%B0_%D0%90%D0%BB%D0%BC%D0%B0-%D0%90%D1%82%D1%83_%D1%81_%D0%B3%D0%BE%D1%80%D1%8B_%D0%9A%D0%BE%D0%BA_%D0%A2%D1%8E%D0%B1%D0%B5.jpg/1280px-13_%D0%92%D0%B8%D0%B4_%D0%BD%D0%B0_%D0%90%D0%BB%D0%BC%D0%B0-%D0%90%D1%82%D1%83_%D1%81_%D0%B3%D0%BE%D1%80%D1%8B_%D0%9A%D0%BE%D0%BA_%D0%A2%D1%8E%D0%B1%D0%B5.jpg", // アルマトイ
  ASJ: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Kinsakubaru_wildwood.jpg/1280px-Kinsakubaru_wildwood.jpg", // 奄美
  ATL: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/A2ATL20250614-0721_%28cropped%29.jpg/1280px-A2ATL20250614-0721_%28cropped%29.jpg", // アトランタ (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  AUH: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Abu_dhabi_skylines_2014.jpg/1280px-Abu_dhabi_skylines_2014.jpg", // アブダビ
  AYT: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Yivli_Minaret_Mosque_Antalya.jpg/1280px-Yivli_Minaret_Mosque_Antalya.jpg", // アンタルヤ
  BAK: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Azerbaijan_State_Academic_Opera_and_Ballet_Theatre_main_fa%C3%A7ade%2C_2015.jpg/1280px-Azerbaijan_State_Academic_Opera_and_Ballet_Theatre_main_fa%C3%A7ade%2C_2015.jpg", // バクー (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  BDS: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Le_colonne_della_Via_Appia_a_Brindisi.jpg/1280px-Le_colonne_della_Via_Appia_a_Brindisi.jpg", // ブリンディジ
  BEG: "https://upload.wikimedia.org/wikipedia/commons/8/88/Belgrade_panorama.jpg", // ベオグラード
  BLQ: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Arena_del_Sole_%28cropped%29.jpg/1280px-Arena_del_Sole_%28cropped%29.jpg", // ボローニャ (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  BOS: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Boston_-Massachusetts_State_House_%2848718911666%29.jpg/1280px-Boston_-Massachusetts_State_House_%2848718911666%29.jpg", // ボストン (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  BQS: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Triumphal_arch_in_Blagoveshchensk_2015-11_1448449848.jpg/1280px-Triumphal_arch_in_Blagoveshchensk_2015-11_1448449848.jpg", // ブラゴヴェシチェンスク
  BRI: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Puglia_bari_old-town.jpg/1280px-Puglia_bari_old-town.jpg", // バーリ
  BRU: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/107_-_March%C3%A9_aux_puces_place_du_Jeu_de_Balle_-_Bruxelles.jpg/1280px-107_-_March%C3%A9_aux_puces_place_du_Jeu_de_Balle_-_Bruxelles.jpg", // ブリュッセル (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  BSZ: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Bishkek_City%27s_business_center.jpg/1280px-Bishkek_City%27s_business_center.jpg", // ビシュケク
  BUD: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Chain_Bridge%2C_west_side%2C_2015_Budapest_-_panoramio_%2891%29.jpg/1280px-Chain_Bridge%2C_west_side%2C_2015_Budapest_-_panoramio_%2891%29.jpg", // ブダペスト
  BUH: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Bucharest-Skyline-01.jpg/1280px-Bucharest-Skyline-01.jpg", // ブカレスト
  BUS: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Batumi_sunset_2.jpg/1280px-Batumi_sunset_2.jpg", // バトゥミ
  CAN: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/02540-Guangzhou.jpg/1280px-02540-Guangzhou.jpg", // 広州 (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  CEI: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/%E0%B8%AB%E0%B8%AD%E0%B8%99%E0%B8%B2%E0%B8%AC%E0%B8%B4%E0%B8%81%E0%B8%B2%E0%B9%80%E0%B8%8A%E0%B8%B5%E0%B8%A2%E0%B8%87%E0%B8%A3%E0%B8%B2%E0%B8%A2_Chiang_Rai_Clock_Tower.jpg/1280px-%E0%B8%AB%E0%B8%AD%E0%B8%99%E0%B8%B2%E0%B8%AC%E0%B8%B4%E0%B8%81%E0%B8%B2%E0%B9%80%E0%B8%8A%E0%B8%B5%E0%B8%A2%E0%B8%87%E0%B8%A3%E0%B8%B2%E0%B8%A2_Chiang_Rai_Clock_Tower.jpg", // チェンライ
  CEK: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/%D0%A4%D0%BE%D1%82%D0%BE%D0%B3%D1%80%D0%B0%D1%84%D0%B8%D1%8F_%D0%A7%D0%B5%D0%BB%D1%8F%D0%B1%D0%B8%D0%BD%D1%81%D0%BA%D0%B0_%D1%81_%D0%BE%D1%82%D1%80%D0%B0%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5%D0%BC_%282021%29.jpg/1280px-%D0%A4%D0%BE%D1%82%D0%BE%D0%B3%D1%80%D0%B0%D1%84%D0%B8%D1%8F_%D0%A7%D0%B5%D0%BB%D1%8F%D0%B1%D0%B8%D0%BD%D1%81%D0%BA%D0%B0_%D1%81_%D0%BE%D1%82%D1%80%D0%B0%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5%D0%BC_%282021%29.jpg", // チェリャビンスク
  CGO: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Zhengzhou_photos.png", // 鄭州
  CGQ: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/%E9%81%A5%E6%9C%9B%E5%8D%97%E6%B9%96%E5%8C%97%E5%B2%B8_nan_hu_-_panoramio.jpg/1280px-%E9%81%A5%E6%9C%9B%E5%8D%97%E6%B9%96%E5%8C%97%E5%B2%B8_nan_hu_-_panoramio.jpg", // 長春
  CHI: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/20070909_Chicago_Half_Marathon.JPG/1280px-20070909_Chicago_Half_Marathon.JPG", // シカゴ (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  CJJ: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Cheongju_Sangdangsangseong.jpg/1280px-Cheongju_Sangdangsangseong.jpg", // 清州
  CKG: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Chongqing_Nightscape.jpg/1280px-Chongqing_Nightscape.jpg", // 重慶
  CMB: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Colombo_city_skyline_at_night.png/1280px-Colombo_city_skyline_at_night.png", // コロンボ
  CMN: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Casablanca_-_Morocco_008.jpg", // カサブランカ
  CNX: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/ChiangMaiMoat.jpg/1280px-ChiangMaiMoat.jpg", // チェンマイ
  CTU: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/%E9%9B%AA%E5%B1%B1%E4%B8%8B%E7%9A%84%E6%88%90%E9%83%BD%E5%B8%82%E5%A4%A9%E9%99%85%E7%BA%BF_Chengdu_skyline_with_snow_capped_mountains.jpg/1280px-%E9%9B%AA%E5%B1%B1%E4%B8%8B%E7%9A%84%E6%88%90%E9%83%BD%E5%B8%82%E5%A4%A9%E9%99%85%E7%BA%BF_Chengdu_skyline_with_snow_capped_mountains.jpg", // 成都
  DAC: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Tejgaon_Commercial_Area.jpg/1280px-Tejgaon_Commercial_Area.jpg", // ダッカ
  DAD: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Han_River_Bridge_in_Vietnam_Night_View.jpg/1280px-Han_River_Bridge_in_Vietnam_Night_View.jpg", // ダナン
  DLC: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/27220-Dalian_%2849051709703%29.jpg/1280px-27220-Dalian_%2849051709703%29.jpg", // 大連 (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  DVO: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Bolton_Street%2C_Davao_City.jpg/1280px-Bolton_Street%2C_Davao_City.jpg", // ダバオ
  DYU: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Dushanbe_panorama_05.jpg/1280px-Dushanbe_panorama_05.jpg", // ドゥシャンベ
  EVN: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Yerevan_coll._2015.jpg/1280px-Yerevan_coll._2015.jpg", // エレバン
  FLR: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Aeroporto_di_Firenze_-_main_building_seen_from_restaurant_at_the_1st_floor.jpg/1280px-Aeroporto_di_Firenze_-_main_building_seen_from_restaurant_at_the_1st_floor.jpg", // フィレンツェ (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  FOC: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Fuzhou_Taixi_CBD.jpg", // 福州
  FSZ: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Higashi-Shizuoka_Panorama_02.jpg/1280px-Higashi-Shizuoka_Panorama_02.jpg", // 静岡
  GVA: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Views_of_Geneva.jpg/1280px-Views_of_Geneva.jpg", // ジュネーブ
  HEK: "https://upload.wikimedia.org/wikipedia/commons/b/be/Heilongjiang_%28Amur%29_shore.jpg", // 黒河
  HGH: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/62998-Hangzhou_%2849152700816%29.jpg/1280px-62998-Hangzhou_%2849152700816%29.jpg", // 杭州 (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  HIA: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/%E6%B7%AE%E5%AE%89%E5%BA%9C%E5%A4%A7%E5%A0%82.JPG/1280px-%E6%B7%AE%E5%AE%89%E5%BA%9C%E5%A4%A7%E5%A0%82.JPG", // 淮安
  HKT: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Phuket_Aerial.jpg/1280px-Phuket_Aerial.jpg", // プーケット
  HNA: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/%E8%8A%B1%E5%B7%BB%E6%B8%A9%E6%B3%89_%E3%83%90%E3%83%A9%E5%9C%92%E3%81%A8%E3%83%9B%E3%83%86%E3%83%AB3%E9%A4%A8.jpg/1280px-%E8%8A%B1%E5%B7%BB%E6%B8%A9%E6%B3%89_%E3%83%90%E3%83%A9%E5%9C%92%E3%81%A8%E3%83%9B%E3%83%86%E3%83%AB3%E9%A4%A8.jpg", // 花巻
  HOU: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Buildings-city-houston-skyline-1870617.jpg/1280px-Buildings-city-houston-skyline-1870617.jpg", // ヒューストン (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  HRB: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/26935-Harbin_%2829661238117%29.jpg/1280px-26935-Harbin_%2829661238117%29.jpg", // ハルビン (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  HTA: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/%D0%9A%D0%BE%D0%BB%D0%BB%D0%B0%D0%B6_%D0%A7%D0%B8%D1%82%D0%B0.jpg/1280px-%D0%9A%D0%BE%D0%BB%D0%BB%D0%B0%D0%B6_%D0%A7%D0%B8%D1%82%D0%B0.jpg", // チタ
  IAO: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Picturesque_Guyam_Island%2C_Siargao.jpg/1280px-Picturesque_Guyam_Island%2C_Siargao.jpg", // シアルガオ
  IKT: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Cerkiew_Kaza%C5%84ska_w_Irkucku_02.JPG/1280px-Cerkiew_Kaza%C5%84ska_w_Irkucku_02.JPG", // イルクーツク (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  ISG: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Macchu_picchu03.jpg", // 石垣
  JED: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Jeddah_Waterfront_2025.jpg", // ジッダ
  JKT: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Bundaran_Hotel_Indonesia_%282025%29.jpg/1280px-Bundaran_Hotel_Indonesia_%282025%29.jpg", // ジャカルタ
  JNB: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Johannesburg_skyline_2017.jpg/1280px-Johannesburg_skyline_2017.jpg", // ヨハネスブルグ
  JOG: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Kraton_Yogyakarta_Pagelaran.jpg/1280px-Kraton_Yogyakarta_Pagelaran.jpg", // ジョグジャカルタ
  KBV: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Shell_Cemetery%2C_Krabi%2C_Thailand_SF0001.jpg/1280px-Shell_Cemetery%2C_Krabi%2C_Thailand_SF0001.jpg", // クラビ
  KHV: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/%D0%A3%D1%81%D1%81%D1%83%D1%80%D0%B8%D0%B9%D1%81%D0%BA%D0%B8%D0%B9_%D0%B1%D1%83%D0%BB%D1%8C%D0%B2%D0%B0%D1%80.jpg/1280px-%D0%A3%D1%81%D1%81%D1%83%D1%80%D0%B8%D0%B9%D1%81%D0%BA%D0%B8%D0%B9_%D0%B1%D1%83%D0%BB%D1%8C%D0%B2%D0%B0%D1%80.jpg", // ハバロフスク
  KIJ: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Aerial_photo_of_Niigata_24-May-2019.jpg/1280px-Aerial_photo_of_Niigata_24-May-2019.jpg", // 新潟 (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  KJA: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D0%BE%D1%8F%D1%80%D1%81%D0%BA_%D0%A1%D1%82%D1%80%D0%B5%D0%BB%D0%BA%D0%B0_%D1%81_%D0%B2%D1%8B%D1%81%D0%BE%D1%82%D1%8B.jpg/1280px-%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D0%BE%D1%8F%D1%80%D1%81%D0%BA_%D0%A1%D1%82%D1%80%D0%B5%D0%BB%D0%BA%D0%B0_%D1%81_%D0%B2%D1%8B%D1%81%D0%BE%D1%82%D1%8B.jpg", // クラスノヤルスク
  KMI: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Aoshima_Miyazaki_Japan_2007_08.jpg/1280px-Aoshima_Miyazaki_Japan_2007_08.jpg", // 宮崎 (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  KMQ: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Natadera.jpg", // 小松
  KTM: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Kathmandu-Durbar_Square-06-Mahavishnu-Kuh-Vishnu-Pratapamalla-Jagannath-2007-gje.jpg/1280px-Kathmandu-Durbar_Square-06-Mahavishnu-Kuh-Vishnu-Pratapamalla-Jagannath-2007-gje.jpg", // カトマンズ
  KUH: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Kushiro_Fisherman%27s_Wharf_EGG_and_MOO01n.jpg/1280px-Kushiro_Fisherman%27s_Wharf_EGG_and_MOO01n.jpg", // 釧路 (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  KUM: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Ooko_Falls_03.jpg/1280px-Ooko_Falls_03.jpg", // 屋久島
  KWE: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/View_of_Guiyang%2C_Guizhou_from_Neighboring_Mountains.jpg/1280px-View_of_Guiyang%2C_Guizhou_from_Neighboring_Mountains.jpg", // 貴陽
  KZN: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Architektura_kazan.JPG/1280px-Architektura_kazan.JPG", // カザン (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  LAS: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Fremont_Street_1952.JPG", // ラスベガス (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  LCA: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Palm_trees_promenade.JPG/1280px-Palm_trees_promenade.JPG", // ラルナカ
  LED: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/4A7A3069_Moika%2C_Saint_Petersburg_%2835468573803%29.jpg/1280px-4A7A3069_Moika%2C_Saint_Petersburg_%2835468573803%29.jpg", // サンクトペテルブルク (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  LGK: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Eagle_square_at_Kuah_Langkawi.jpg/1280px-Eagle_square_at_Kuah_Langkawi.jpg", // ランカウイ
  LOS: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Skywater.jpg/1280px-Skywater.jpg", // ラゴス
  MCT: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Downtown_Muscat_%288725487315%29.jpg/1280px-Downtown_Muscat_%288725487315%29.jpg", // マスカット
  MCX: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Dagestan_market.jpg/1280px-Dagestan_market.jpg", // マハチカラ
  MEL: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Melbourne_CBD_and_Ceremonial_Avenue_%28in_2024%29_as_seen_from_the_rooftop_of_Shrine_of_Remembrance.jpg/1280px-Melbourne_CBD_and_Ceremonial_Avenue_%28in_2024%29_as_seen_from_the_rooftop_of_Shrine_of_Remembrance.jpg", // メルボルン
  MES: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Medan.._Downtown.jpg/1280px-Medan.._Downtown.jpg", // メダン
  MFM: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Lago_Nam_Van%2C_Macao%2C_2013-08-08%2C_DD_05.jpg/1280px-Lago_Nam_Van%2C_Macao%2C_2013-08-08%2C_DD_05.jpg", // マカオ
  MIA: "https://upload.wikimedia.org/wikipedia/commons/f/f6/A306%2C_Skyline_at_twilight%2C_Miami%2C_Florida%2C_USA%2C_2010.JPG", // マイアミ (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  MLE: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Male-total.jpg/1280px-Male-total.jpg", // マレ
  MMY: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Miyako_maipama_1.jpg/1280px-Miyako_maipama_1.jpg", // 宮古
  MPH: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Boracay%2C_1985_%288758953461%29.jpg/1280px-Boracay%2C_1985_%288758953461%29.jpg", // ボラカイ
  MSQ: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Babrujskaja%2C_Minsk.jpg/1280px-Babrujskaja%2C_Minsk.jpg", // ミンスク (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
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
  PER: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Beach_sunset_Perth.jpg/1280px-Beach_sunset_Perth.jpg", // パース (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  PQC: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/DuongDong.jpg/1280px-DuongDong.jpg", // フーコック
  PVD: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Brown%27s_University_Hall_in_2007.jpg/1280px-Brown%27s_University_Hall_in_2007.jpg", // プロビデンス (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  RGN: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/2016_Rangun%2C_Ratusz_%2818%29.jpg/1280px-2016_Rangun%2C_Ratusz_%2818%29.jpg", // ヤンゴン (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  RMO: "https://upload.wikimedia.org/wikipedia/commons/7/78/Dacia_Boulevard_%285822778292%29.jpg", // キシナウ
  RMQ: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Beitun_Wenchang_Temple.JPG/1280px-Beitun_Wenchang_Temple.JPG", // 台中 (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  RNJ: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Yoron_Island_20080622.jpg", // 与論
  RUH: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Riyadh%2C_Saudi_Arabia_%282048x1367%29_%2836864830374%29.jpg/1280px-Riyadh%2C_Saudi_Arabia_%282048x1367%29_%2836864830374%29.jpg", // リヤド
  SCL: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/2019-04-06-12h10m43.jpg/1280px-2019-04-06-12h10m43.jpg", // サンティアゴ (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  SDK: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Sandakan.jpg/1280px-Sandakan.jpg", // サンダカン
  SHE: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/%E6%B2%88%E9%98%B3%E6%B5%91%E6%B2%B3%E5%A4%A7%E6%A1%A5%E5%A4%A9%E9%99%85%E7%BA%BF.jpg/1280px-%E6%B2%88%E9%98%B3%E6%B5%91%E6%B2%B3%E5%A4%A7%E6%A1%A5%E5%A4%A9%E9%99%85%E7%BA%BF.jpg", // 瀋陽
  SHJ: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Sharjah%2C_UAE.jpg/1280px-Sharjah%2C_UAE.jpg", // シャルジャ
  SHM: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/131221_Shirarahama_Beach_Shirahama_Wakayama_pref_Japan07s3bs.jpg/1280px-131221_Shirarahama_Beach_Shirahama_Wakayama_pref_Japan07s3bs.jpg", // 南紀白浜 (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  SJC: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Adobe_HQ.jpg/1280px-Adobe_HQ.jpg", // サンノゼ (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  SKD: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/RegistanSquare_Samarkand.jpg/1280px-RegistanSquare_Samarkand.jpg", // サマルカンド
  SLC: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Front_view_of_State_Capitol_Building.jpg/1280px-Front_view_of_State_Capitol_Building.jpg", // ソルトレイクシティ
  STR: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Neues_Schloss_Schlossplatzspringbrunnen_Schlossplatz_Stuttgart_2015_01.jpg/1280px-Neues_Schloss_Schlossplatzspringbrunnen_Schlossplatz_Stuttgart_2015_01.jpg", // シュトゥットガルト
  SVO: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/0169_-_Moskau_2015_-_Roter_Platz_%2825795529393%29.jpg/1280px-0169_-_Moskau_2015_-_Roter_Platz_%2825795529393%29.jpg", // モスクワ (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  SVX: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Yekaterinburg-overview-april-2015-russia-0001.jpg/1280px-Yekaterinburg-overview-april-2015-russia-0001.jpg", // エカテリンブルク
  SYX: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Tianya_Haijiao_-_01.jpg/1280px-Tianya_Haijiao_-_01.jpg", // 三亜
  SZX: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/20201112_The_skyline_at_Shenzhen_Bay.jpg/1280px-20201112_The_skyline_at_Shenzhen_Bay.jpg", // 深セン (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  TAK: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/JP-Kagawa-Great-Seto-Bridge-Minami_Bisan-Seto-Bridge.jpg/1280px-JP-Kagawa-Great-Seto-Bridge-Minami_Bisan-Seto-Bridge.jpg", // 高松 (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  TAO: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/20240730_Qingdao_Christ_Church_01.jpg/1280px-20240730_Qingdao_Christ_Church_01.jpg", // 青島 (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  TAS: "https://upload.wikimedia.org/wikipedia/commons/3/33/Tashkent_skyline_2019.jpg", // タシケント
  TBS: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/2014_Tbilisi%2C_Widoki_z_Twierdzy_Narikala_%2836%29.jpg/1280px-2014_Tbilisi%2C_Widoki_z_Twierdzy_Narikala_%2836%29.jpg", // トビリシ (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  TNE: "https://upload.wikimedia.org/wikipedia/commons/5/53/H2A11001.jpg", // 種子島
  TSJ: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Miuda_Beach%2C_Tsushima_on_March_2nd%2C_2017.jpg/1280px-Miuda_Beach%2C_Tsushima_on_March_2nd%2C_2017.jpg", // 対馬
  TSN: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/2025_SCO_Summit_-_Tianjin_Meijiang_International_Convention_and_Exhibition_Center.jpg/1280px-2025_SCO_Summit_-_Tianjin_Meijiang_International_Convention_and_Exhibition_Center.jpg", // 天津 (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  UBN: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/UB_downtown.jpg/1280px-UB_downtown.jpg", // ウランバートル
  UFA: "https://upload.wikimedia.org/wikipedia/commons/1/17/Ufa01.jpg", // ウファ
  USM: "https://upload.wikimedia.org/wikipedia/commons/8/80/Koh_Samui_Lipa_Noi2.jpg", // サムイ
  UTP: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Hilton_Pattaya_Pool_dusk_view_201801.jpg/1280px-Hilton_Pattaya_Pool_dusk_view_201801.jpg", // パタヤ (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  VLC: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Malvarrosa_Beach%2C_Valencia%2C_Spain_%2829812271043%29.jpg/1280px-Malvarrosa_Beach%2C_Valencia%2C_Spain_%2829812271043%29.jpg", // バレンシア
  VTE: "https://upload.wikimedia.org/wikipedia/en/thumb/2/28/Vientiane_-_Patuxai_-_0003.jpg/1280px-Vientiane_-_Patuxai_-_0003.jpg", // ビエンチャン
  VVO: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Center_of_Vladivostok_and_Zolotoy_Rog.jpg", // ウラジオストク
  WKJ: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Aniwamaru_and_Wakkanai_port_north_pier.jpg/1280px-Aniwamaru_and_Wakkanai_port_north_pier.jpg", // 稚内 (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  XMN: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/20121031_Xiamen_University_01.jpg/1280px-20121031_Xiamen_University_01.jpg", // 廈門 (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
  YGJ: "https://upload.wikimedia.org/wikipedia/commons/3/37/Gotohke_jutaku.jpg", // 米子 (単体写真。旧: montage/collage はコラージュで枠に別画像が割り込んで見えた)
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
