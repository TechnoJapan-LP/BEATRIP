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
  PUS: "https://images.unsplash.com/photo-1604429181848-9bcd61c0bd84?w=800&q=80",
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
  HKD: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Hakodate_montage.jpg/960px-Hakodate_montage.jpg",
  MYJ: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Matsuyama_montage.jpg/960px-Matsuyama_montage.jpg",
  KCZ: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Kochi_montage.jpg/960px-Kochi_montage.jpg",
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
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80", // 道と山
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80", // 機窓・翼
  "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80", // 雲海
  "https://images.unsplash.com/photo-1503221043305-f7498f8b7888?w=800&q=80", // 空港・出発
  // 注: photo-1530521954074 (世界地図とカメラ) は被写体がカメラ本体で
  //     「航空券セール」の記事カバーとして意味が通らないため除外した。
  //     航空・空・旅の移動を想起させる画像だけをプールに残す。
  "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?w=800&q=80", // 飛行機と夕焼け
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80", // 山並みと光
  "https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=800&q=80", // ロードトリップ
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
