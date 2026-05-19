import type { AirlineProfile } from "@/lib/scrapers/types";

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
    code: "APJ",
    name: "Spring Japan",
    nameEn: "Spring Japan",
    logo: "/airlines/APJ.png",
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
];

export function getAirlineByCode(code: string) {
  return airlines.find((a) => a.code === code);
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
