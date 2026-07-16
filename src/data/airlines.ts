import type { AirlineProfile } from "@/lib/scrapers/types";

// ── `code` について ──
// code は URL (/airlines/[code], /[code]/sales, /[code]/airports/[iata]) に
// そのまま出るため、実在コードかどうかより「既存 URL を壊さないこと」を優先する。
// 体系は統一されていない: ANA/JAL/JJP/SJO は ICAO、それ以外は IATA。
//
// PCH (Peach) だけはどちらでもない BEATRIP 内部の slug。実コードは IATA "MM" /
// ICAO "APJ"。/airlines/PCH/sales が GSC の勝ちページで、リネームすると
// 唯一の上位ページに 301 を挟むことになるため据え置いている (2026-07 判断)。
// APJ を Peach に付け替える案も検討したが、旧 /airlines/APJ/* は Spring Japan の
// コンテンツとしてインデックスされていた経緯があり、Peach へ向けると内容の
// 異なるページへの転送になるため見送った。
//
// airports.ts の airlines[] とは突き合わせて空港ページを生成する
// (sitemap.ts / airports/[iata]/page.tsx)。あちらは SKY/ZIP/SNA/SFJ 等の別体系が
// 混ざっているため、両者は `aliases` で繋ぐ。突き合わせは必ず
// airlineServesAirport() / getAirlineByCode() を通すこと — 生の文字列一致で
// 比較すると、別表記の社が黙って 0 枚になったり、コードが衝突した別の社に
// 就航データが付いて虚偽表示になる (APJ が Peach と Spring Japan で衝突した事故)。
// 新しい表記が出てきたら code を触るのではなく aliases に足す。
export const airlines: AirlineProfile[] = [
  {
    code: "ANA",
    name: "全日本空輸",
    nameEn: "ANA",
    logo: "/airlines/ANA.png",
    color: "#00467F",
    type: "FSC",
    country: "JP",
    scrapeSources: [
      {
        name: "ANA公式セールページ",
        url: "https://www.ana.co.jp/ja/jp/promotionl/",
        type: "html",
        selector: ".promotion-list",
      },
    ],
  },
  {
    code: "JAL",
    name: "日本航空",
    nameEn: "JAL",
    logo: "/airlines/JAL.png",
    color: "#CC0000",
    type: "FSC",
    country: "JP",
    scrapeSources: [
      {
        name: "JAL公式セールページ",
        url: "https://www.jal.co.jp/jp/ja/campaign/",
        type: "html",
        selector: ".campaign-list",
      },
    ],
  },
  {
    // PCH は実在コードではなく内部 slug (実コード: IATA "MM" / ICAO "APJ")。
    // 勝ちページ /airlines/PCH/sales の URL 保護のため据え置き。冒頭の注記参照。
    code: "PCH",
    name: "Peach Aviation",
    nameEn: "Peach",
    logo: "/airlines/PCH.png",
    color: "#FF6B9D",
    type: "LCC",
    country: "JP",
    scrapeSources: [
      {
        name: "Peach公式",
        url: "https://www.flypeach.com/campaign",
        type: "html",
        selector: ".campaign-card",
      },
    ],
  },
  {
    code: "JJP",
    name: "ジェットスター・ジャパン",
    nameEn: "Jetstar Japan",
    logo: "/airlines/JJP.png",
    color: "#FF6600",
    type: "LCC",
    country: "JP",
    scrapeSources: [
      {
        name: "Jetstar公式",
        url: "https://www.jetstar.com/jp/ja/deals",
        type: "html",
        selector: ".deal-card",
      },
    ],
  },
  {
    // ICAO: SJO。APJ は Peach の ICAO なので使わない (旧 APJ から 301 済み)。
    code: "SJO",
    name: "Spring Japan",
    nameEn: "Spring Japan",
    logo: "/airlines/SJO.png",
    color: "#00A651",
    type: "LCC",
    country: "JP",
    scrapeSources: [
      {
        name: "Spring Japan公式",
        url: "https://jp.ch.com/campaign",
        type: "html",
      },
    ],
  },
  {
    code: "TW",
    name: "ティーウェイ航空",
    nameEn: "T'way Air",
    logo: "/airlines/TW.png",
    color: "#E60012",
    type: "LCC",
    country: "KR",
    scrapeSources: [
      {
        name: "T'way公式",
        url: "https://www.twayair.com/promotion",
        type: "html",
      },
    ],
  },
  {
    code: "VJ",
    name: "ベトジェットエア",
    nameEn: "VietJet Air",
    logo: "/airlines/VJ.png",
    color: "#E31837",
    type: "LCC",
    country: "VN",
    scrapeSources: [
      {
        name: "VietJet公式",
        url: "https://www.vietjetair.com/promotion",
        type: "html",
      },
    ],
  },
  {
    code: "EK",
    name: "エミレーツ航空",
    nameEn: "Emirates",
    logo: "/airlines/EK.png",
    color: "#D71921",
    type: "FSC",
    country: "AE",
    scrapeSources: [
      {
        name: "Emirates公式",
        url: "https://www.emirates.com/jp/japanese/special-offers/",
        type: "html",
        selector: ".offer-card",
      },
    ],
  },
  {
    code: "SQ",
    name: "シンガポール航空",
    nameEn: "Singapore Airlines",
    logo: "/airlines/SQ.png",
    color: "#F5A623",
    type: "FSC",
    country: "SG",
    scrapeSources: [
      {
        name: "SIA公式",
        url: "https://www.singaporeair.com/en_UK/jp/special-offers/",
        type: "html",
      },
    ],
  },
  {
    code: "CX",
    name: "キャセイパシフィック航空",
    nameEn: "Cathay Pacific",
    logo: "/airlines/CX.png",
    color: "#006564",
    type: "FSC",
    country: "HK",
    scrapeSources: [
      {
        name: "Cathay公式",
        url: "https://www.cathaypacific.com/cx/ja_JP/special-offers.html",
        type: "html",
      },
    ],
  },
  // ── 「{航空会社} セール いつ」需要の拡張分 (GSC で PCH/sales が勝ちページと
  //    判明したため、同型ページを増やす)。scrapeSources が空の社は Traicy RSS
  //    フォールバックで自動収集される (traicy-scraper の社名マップと同じ
  //    IATA コードを使用)。logo はブランドロゴの捏造を避けモノグラム SVG。──
  {
    code: "BC",
    aliases: ["SKY"], // ICAO
    name: "スカイマーク",
    nameEn: "Skymark Airlines",
    logo: "/airlines/BC.svg",
    color: "#0072BC",
    type: "FSC",
    country: "JP",
    scrapeSources: [],
  },
  {
    code: "ZG",
    aliases: ["ZIP"],
    name: "ZIPAIR",
    nameEn: "ZIPAIR Tokyo",
    logo: "/airlines/ZG.svg",
    color: "#00A99D",
    type: "LCC",
    country: "JP",
    scrapeSources: [],
  },
  {
    code: "TR",
    name: "スクート",
    nameEn: "Scoot",
    logo: "/airlines/TR.svg",
    color: "#FFB81C",
    type: "LCC",
    country: "SG",
    scrapeSources: [],
  },
  {
    code: "7C",
    name: "チェジュ航空",
    nameEn: "Jeju Air",
    logo: "/airlines/7C.svg",
    color: "#FF6600",
    type: "LCC",
    country: "KR",
    scrapeSources: [],
  },
  {
    code: "HD",
    aliases: ["AIRDO", "ADO"], // ADO = ICAO
    name: "AIRDO",
    nameEn: "AIRDO",
    logo: "/airlines/HD.svg",
    color: "#F5A200",
    type: "FSC",
    country: "JP",
    scrapeSources: [],
  },
  {
    code: "6J",
    aliases: ["SNA", "SNJ"], // SNA = 旧社名 Skynet Asia Airways 由来, SNJ = ICAO
    name: "ソラシドエア",
    nameEn: "Solaseed Air",
    logo: "/airlines/6J.svg",
    color: "#8DC63F",
    type: "FSC",
    country: "JP",
    scrapeSources: [],
  },
  {
    code: "7G",
    aliases: ["SFJ"], // ICAO
    name: "スターフライヤー",
    nameEn: "StarFlyer",
    logo: "/airlines/7G.svg",
    color: "#1A1A1A",
    type: "FSC",
    country: "JP",
    scrapeSources: [],
  },
];

/**
 * 正規 code か aliases のいずれかに一致するか。
 *
 * 他データ (airports.ts 等) は同じ社を別表記で持っていることがあるため、
 * 突き合わせは必ずこれを通す。生の `a.code === code` で比較すると、
 * 別表記の社が黙って 0 件になったり、コードが偶然衝突した別の社に
 * 就航データが付いて虚偽表示になる (ab2324e の APJ/Peach 事故)。
 */
export function airlineHasCode(airline: AirlineProfile, code: string) {
  const c = code.trim().toUpperCase();
  return airline.code === c || (airline.aliases?.includes(c) ?? false);
}

/** 空港マスタの airlines[] に、その社が (別表記も含めて) 載っているか */
export function airlineServesAirport(
  airline: AirlineProfile,
  airport: { airlines: string[] }
) {
  return airport.airlines.some((c) => airlineHasCode(airline, c));
}

/** 正規 code または別表記から航空会社を解決。未登録キャリアは undefined */
export function getAirlineByCode(code: string) {
  return airlines.find((a) => airlineHasCode(a, code));
}

/** 表示名（nameEn / name）から航空会社を解決。未登録キャリアは undefined */
export function getAirlineByName(name: string) {
  const n = name.trim().toLowerCase();
  return airlines.find(
    (a) =>
      a.nameEn.toLowerCase() === n ||
      a.name.toLowerCase() === n ||
      a.code.toLowerCase() === n
  );
}
