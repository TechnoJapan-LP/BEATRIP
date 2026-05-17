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

  // 国際線 — ヨーロッパ
  CDG: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
  LHR: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
  HEL: "https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?w=800&q=80",
  FCO: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
  BCN: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80",
  FRA: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80",
  AMS: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&q=80",
  IST: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80",

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

  // 国内線
  CTS: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
  OKA: "https://images.unsplash.com/photo-1583396618422-c7dea4e8e925?w=800&q=80",
  FUK: "https://images.unsplash.com/photo-1513415277900-a62401e19be4?w=800&q=80",
  KIX: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
  ITM: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
  NGO: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80",
  HIJ: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&q=80",
  KOJ: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800&q=80",
  SDJ: "https://images.unsplash.com/photo-1542640244-7e672d6cef4e?w=800&q=80",
  KMJ: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800&q=80",
  NRT: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
  HND: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80";

export function getDestinationImage(code: string): string {
  return DESTINATION_IMAGES[code] ?? FALLBACK_IMAGE;
}
