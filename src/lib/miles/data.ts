import awardChartsJson from "@/data/miles/award-charts.json";
import cardsJson from "@/data/miles/cards.json";
import destinationsJson from "@/data/miles/destinations.json";
import priorityPassJson from "@/data/miles/priority-pass.json";
import transferRoutesJson from "@/data/miles/transfer-routes.json";

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

export type FuelSurcharge = {
  /** 1旅客1区間片道あたり (両社とも片道区間単位で公表) */
  unit: "perSectorOneWay";
  /** 発券 (購入) 期間。燃油は2ヶ月ごとに改定されるため、期限切れの額を出すと虚偽になる */
  validFrom: string;
  validUntil: string;
  source: string;
  verifiedAt: string;
  notes: string;
  bands: { label: string; oneWayYen: number; destinationCodes: string[] }[];
};

export type ProgramAlliance = {
  name: string;
  nameEn: string;
  source: string;
  verifiedAt: string;
  note: string;
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
  fuelSurcharge?: FuelSurcharge;
  alliance?: ProgramAlliance;
};

export type PriorityPassPlan = {
  id: string;
  name: string;
  annualFeeUsd: number;
  /** null = 本人無制限無料 */
  freeVisits: number | null;
  visitFeeUsd: number;
  tagline: string;
};

export type PriorityPassPricing = {
  source: string;
  verifiedAt: string;
  currency: "USD";
  guestFeeUsd: number;
  plans: PriorityPassPlan[];
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
    if (p.alliance) {
      assertProvenance(`alliance(${p.id})`, p.id, p.alliance.source, p.alliance.verifiedAt);
    }
    const fs = p.fuelSurcharge;
    if (fs) {
      assertProvenance(`fuelSurcharge(${p.id})`, p.id, fs.source, fs.verifiedAt);
      if (!DATE_RE.test(fs.validFrom) || !DATE_RE.test(fs.validUntil)) {
        throw new Error(`miles data: fuelSurcharge "${p.id}" の validFrom/validUntil (YYYY-MM-DD) が不正です。期限のない燃油額は掲載できません。`);
      }
      for (const band of fs.bands) {
        if (!(band.oneWayYen > 0) || !band.destinationCodes?.length) {
          throw new Error(`miles data: fuelSurcharge "${p.id}" のバンド "${band.label}" が不正です。`);
        }
      }
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

export type TransferRoute = {
  id: string;
  pointName: string;
  issuer: string;
  programId: string;
  rate: { points: number; miles: number };
  rateLabel: string;
  notes: string;
  source: string;
  verifiedAt: string;
};

let transferCache: TransferRoute[] | null = null;

export function getTransferRoutes(): TransferRoute[] {
  if (transferCache) return transferCache;
  const routes = (transferRoutesJson as { routes: TransferRoute[] }).routes;
  const programIds = new Set(getMilePrograms().map((p) => p.id));
  for (const r of routes) {
    assertProvenance("transfer-route", r.id, r.source, r.verifiedAt);
    if (!programIds.has(r.programId)) {
      throw new Error(`miles data: transfer-route "${r.id}" の programId "${r.programId}" が award-charts に存在しません。`);
    }
    if (!(r.rate.points > 0) || !(r.rate.miles > 0)) {
      throw new Error(`miles data: transfer-route "${r.id}" の rate が不正です。`);
    }
  }
  transferCache = routes;
  return routes;
}

let ppCache: PriorityPassPricing | null = null;

export function getPriorityPassPricing(): PriorityPassPricing {
  if (ppCache) return ppCache;
  const pp = priorityPassJson as PriorityPassPricing;
  assertProvenance("priority-pass", "pricing", pp.source, pp.verifiedAt);
  if (!pp.plans?.length) {
    throw new Error("miles data: priority-pass.json に plans がありません。");
  }
  for (const plan of pp.plans) {
    if (!(plan.annualFeeUsd > 0)) {
      throw new Error(`miles data: priority-pass plan "${plan.id}" の annualFeeUsd が不正です。`);
    }
  }
  ppCache = pp;
  return pp;
}

export type MilesFreshness = {
  /** 全データの最終確認日 */
  verifiedAt: string;
  /** 最も古い確認日と、その経過日数 */
  oldestVerifiedAt: string;
  oldestAgeDays: number;
  /** 期限つきデータ (燃油サーチャージ) の状態 */
  expiring: {
    id: string;
    validUntil: string;
    /** 失効までの日数。マイナスなら失効済み (= 金額が画面から消えている) */
    daysLeft: number;
    expired: boolean;
  }[];
  /** 要対応の警告。空なら健全 */
  warnings: string[];
};

const STALE_AFTER_DAYS = 180;
const EXPIRY_WARN_DAYS = 21;

function daysBetween(from: string, to: string): number {
  const ms = Date.parse(to) - Date.parse(from);
  return Math.floor(ms / 86_400_000);
}

/**
 * マイルデータの鮮度診断。
 *
 * ここのデータは公式サイトからの手動転記なので、放置すると静かに腐る
 * (燃油サーチャージは2ヶ月ごとに改定され、失効すると画面から金額が消える)。
 * 「消える」のは嘘をつかないための正しい挙動だが、誰も気づかないと機能が
 * 痩せたまま放置される。/api/health/scrape から監視できるようにして、
 * 更新すべき時期を検知可能にするのが目的。
 */
export function getMilesFreshness(today: string): MilesFreshness {
  const programs = getMilePrograms();
  const cards = getMileCards();
  const pp = getPriorityPassPricing();
  const transfers = getTransferRoutes();

  const allDates = [
    ...programs.map((p) => p.verifiedAt),
    ...programs.flatMap((p) => (p.alliance ? [p.alliance.verifiedAt] : [])),
    ...programs.flatMap((p) => (p.fuelSurcharge ? [p.fuelSurcharge.verifiedAt] : [])),
    ...cards.flatMap((c) => c.sources.map((s) => s.verifiedAt)),
    ...transfers.map((r) => r.verifiedAt),
    pp.verifiedAt,
  ].sort();

  const oldest = allDates[0] ?? today;
  const oldestAgeDays = daysBetween(oldest, today);

  const expiring = programs
    .filter((p) => p.fuelSurcharge)
    .map((p) => {
      const validUntil = p.fuelSurcharge!.validUntil;
      const daysLeft = daysBetween(today, validUntil);
      return { id: p.id, validUntil, daysLeft, expired: daysLeft < 0 };
    });

  const warnings: string[] = [];
  for (const e of expiring) {
    if (e.expired) {
      warnings.push(
        `${e.id}: 燃油サーチャージが ${e.validUntil} で失効済み (画面から金額が消えています)。公式の現行額を確認して award-charts.json を更新してください`
      );
    } else if (e.daysLeft <= EXPIRY_WARN_DAYS) {
      warnings.push(
        `${e.id}: 燃油サーチャージが ${e.validUntil} に失効します (あと${e.daysLeft}日)。次期の公表額を確認してください`
      );
    }
  }
  if (oldestAgeDays > STALE_AFTER_DAYS) {
    warnings.push(
      `マイルデータの最終確認から ${oldestAgeDays} 日経過 (最古: ${oldest})。公式サイトで現行値を再確認してください`
    );
  }

  return {
    verifiedAt: allDates.at(-1) ?? today,
    oldestVerifiedAt: oldest,
    oldestAgeDays,
    expiring,
    warnings,
  };
}

/**
 * 目的地の空港コード → /miles の目的地 id。
 * /miles が扱う都市 (destinations.json) のときだけ id を返す。
 * ディール詳細から「マイルなら？」導線を出すかの判定に使う。
 */
export function milesDestinationIdFor(destinationCode: string): string | null {
  const dest = getMileDestinations().find((d) =>
    d.destinationCodes.includes(destinationCode)
  );
  return dest?.id ?? null;
}

/** データ全体の最終確認日 (画面の「◯年◯月時点の情報」表示に使う) */
export function getMilesDataVerifiedAt(): string {
  const dates = [
    ...getMilePrograms().map((p) => p.verifiedAt),
    ...getMileCards().flatMap((c) => c.sources.map((s) => s.verifiedAt)),
  ];
  return dates.sort().at(-1) ?? "";
}
