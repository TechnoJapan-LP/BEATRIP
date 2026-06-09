/**
 * エリア (空港 / 地方リージョン) → ホテル都市スラッグの対応表。
 *
 * `/hotels/{city}` には豊富なキュレートホテル情報があるが、空港・地方ページからの
 * 導線が薄かった。CTR と収益最大化のため、各エリアに該当するホテル都市の
 * おすすめホテルをコンパクトに表示する。
 *
 * スラッグは `CURATED_HOTELS` に存在するものに限定 (存在しない都市を返すと
 * コンポーネント側で null になる)。
 */

/** IATA 空港コード → hotel-destinations slug 配列 */
export const AIRPORT_TO_HOTEL_CITY: Record<string, string[]> = {
  // 日本
  HND: ["tokyo"],
  NRT: ["tokyo"],
  KIX: ["osaka"],
  ITM: ["osaka"],
  UKB: ["osaka"],
  CTS: ["sapporo"],
  OKD: ["sapporo"],
  FUK: ["fukuoka"],
  OKA: ["okinawa"],
  HIJ: ["hiroshima"],
  NGO: ["nagoya"],
  NKM: ["nagoya"],
  SDJ: ["sendai"],
  // アジア
  HKG: ["hong-kong"],
  ICN: ["seoul"],
  GMP: ["seoul"],
  TPE: ["taipei"],
  TSA: ["taipei"],
  SIN: ["singapore"],
  BKK: ["bangkok"],
  DMK: ["bangkok"],
  HAN: ["hanoi"],
  SGN: ["ho-chi-minh-city"],
  PVG: ["shanghai"],
  SHA: ["shanghai"],
  MNL: ["manila"],
  // ヨーロッパ
  CDG: ["paris"],
  ORY: ["paris"],
  LHR: ["london"],
  LGW: ["london"],
  STN: ["london"],
  HEL: ["helsinki"],
  FCO: ["rome"],
  CIA: ["rome"],
  BCN: ["barcelona"],
  // アメリカ
  JFK: ["new-york"],
  EWR: ["new-york"],
  LGA: ["new-york"],
  LAX: ["los-angeles"],
  HNL: ["honolulu"],
  // 中東
  DXB: ["dubai"],
  // オセアニア
  SYD: ["sydney"],
  AKL: ["auckland"],
  GUM: ["guam"],
};

/** 国内 region slug (local-flights の region) → hotel-destinations slug 配列 */
export const REGION_TO_HOTEL_CITIES: Record<string, string[]> = {
  hokkaido: ["sapporo"],
  tohoku: ["sendai"],
  kanto: ["tokyo"],
  chubu: ["nagoya"],
  kinki: ["osaka"],
  chugoku: ["hiroshima"],
  shikoku: [],
  kyushu: ["fukuoka"],
  okinawa: ["okinawa"],
};

/** 空港コードから関連するホテル都市スラッグを取得 (該当なしは空配列) */
export function getHotelCitiesForAirport(iata: string): string[] {
  return AIRPORT_TO_HOTEL_CITY[iata.toUpperCase()] ?? [];
}

/** 地方リージョンスラッグから関連するホテル都市スラッグを取得 (該当なしは空配列) */
export function getHotelCitiesForRegion(slug: string): string[] {
  return REGION_TO_HOTEL_CITIES[slug.toLowerCase()] ?? [];
}
