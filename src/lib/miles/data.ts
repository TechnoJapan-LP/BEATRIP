import awardChartsJson from "@/data/miles/award-charts.json";
import cardsJson from "@/data/miles/cards.json";
import destinationsJson from "@/data/miles/destinations.json";

/**
 * マイルシミュレーターのデータローダー
 *
 * ここのデータは「必要マイル数」「年会費」など全て事実の表明であり、
 * 出所の無い数字を1つでも出すとサイト全体の信頼を毀損する
 * (2026-07-17 に捏造セール履歴を全削除した経緯がある)。
 *
 * そのため読み込み時に検証し、source / verifiedAt を欠くプログラムや
 * カードが混入した場合はビルド/リクエストを失敗させる。
 * 「出所のない数字はデプロイできない」を機械的に保証するのが目的。
 */

export type SeasonMiles = { low: number; regular: number; high: number };

export type AnaZone = {
  zoneId: string;
  label: string;
  destinationCodes: string[];
  roundTripMiles: { economy: SeasonMiles; business: SeasonMiles };
  notes?: string;
};

export type JalRoute = {
  routeId: string;
  label: string;
  destinationCodes: string[];
  oneWayBasicMiles: { economy: number; business: number };
  notes?: string;
};

export type MileProgram = {
  id: string;
  name: string;
  airlineCode: string;
  chartType: "zone-season" | "route-basic-plus";
  fareBasis: "roundTrip" | "oneWay";
  seasonNote: string;
  surchargeNote: string;
  source: string;
  verifiedAt: string;
  zones?: AnaZone[];
  routes?: JalRoute[];
};

export type MileCard = {
  id: string;
  name: string;
  programId: string | null;
  annualFeeYen: number;
  annualFeeNote: string | null;
  mileEarning: {
    base: { yenPerMile: number; label: string } | null;
    boosted: {
      yenPerMile: number | null;
      label: string;
      optionName: string;
      optionFeeYen: number | null;
      optionFeeNote?: string;
    } | null;
  } | null;
  mileEarningNote?: string;
  lounge: { priorityPass: boolean; detail: string } | null;
  affiliatePartnerId: string | null;
  affiliateNote: string | null;
  officialUrl: string;
  sources: { url: string; covers: string; verifiedAt: string }[];
  fitTags: string[];
};

export type MileDestination = {
  id: string;
  label: string;
  labelEn: string;
  destinationCodes: string[];
  anaZoneId: string | null;
  jalRouteId: string | null;
  notes?: string;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function assertProvenance(kind: string, id: string, source: unknown, verifiedAt: unknown) {
  if (typeof source !== "string" || !source.startsWith("https://")) {
    throw new Error(`miles data: ${kind} "${id}" に source (公式URL) がありません。出所のない数字は公開できません。`);
  }
  if (typeof verifiedAt !== "string" || !DATE_RE.test(verifiedAt)) {
    throw new Error(`miles data: ${kind} "${id}" の verifiedAt (YYYY-MM-DD) がありません。`);
  }
}

let programsCache: MileProgram[] | null = null;
let cardsCache: MileCard[] | null = null;
let destinationsCache: MileDestination[] | null = null;

export function getMilePrograms(): MileProgram[] {
  if (programsCache) return programsCache;
  const programs = (awardChartsJson as { programs: MileProgram[] }).programs;
  for (const p of programs) {
    assertProvenance("program", p.id, p.source, p.verifiedAt);
    const entries = p.chartType === "zone-season" ? p.zones : p.routes;
    if (!entries || entries.length === 0) {
      throw new Error(`miles data: program "${p.id}" にゾーン/路線がありません。`);
    }
  }
  programsCache = programs;
  return programs;
}

export function getMileCards(): MileCard[] {
  if (cardsCache) return cardsCache;
  const cards = (cardsJson as { cards: MileCard[] }).cards;
  for (const c of cards) {
    if (!c.sources?.length) {
      throw new Error(`miles data: card "${c.id}" に sources がありません。`);
    }
    for (const s of c.sources) assertProvenance("card", c.id, s.url, s.verifiedAt);
    if (typeof c.annualFeeYen !== "number") {
      throw new Error(`miles data: card "${c.id}" の annualFeeYen が数値ではありません。`);
    }
  }
  cardsCache = cards;
  return cards;
}

export function getMileDestinations(): MileDestination[] {
  if (destinationsCache) return destinationsCache;
  const destinations = (destinationsJson as { destinations: MileDestination[] }).destinations;
  const programs = getMilePrograms();
  const ana = programs.find((p) => p.id === "ana-mileage-club");
  const jal = programs.find((p) => p.id === "jal-mileage-bank");
  for (const d of destinations) {
    // 参照切れ (zoneId/routeId のタイポ) をビルドで検出する
    if (d.anaZoneId && !ana?.zones?.some((z) => z.zoneId === d.anaZoneId)) {
      throw new Error(`miles data: destination "${d.id}" の anaZoneId "${d.anaZoneId}" が award-charts に存在しません。`);
    }
    if (d.jalRouteId && !jal?.routes?.some((r) => r.routeId === d.jalRouteId)) {
      throw new Error(`miles data: destination "${d.id}" の jalRouteId "${d.jalRouteId}" が award-charts に存在しません。`);
    }
  }
  destinationsCache = destinations;
  return destinations;
}

/** データ全体の最終確認日 (画面の「◯年◯月時点の情報」表示に使う) */
export function getMilesDataVerifiedAt(): string {
  const dates = [
    ...getMilePrograms().map((p) => p.verifiedAt),
    ...getMileCards().flatMap((c) => c.sources.map((s) => s.verifiedAt)),
  ];
  return dates.sort().at(-1) ?? "";
}
