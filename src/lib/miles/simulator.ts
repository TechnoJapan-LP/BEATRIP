import type { MileCard, MileDestination, MileProgram } from "./data";

/**
 * マイルシミュレーターの計算ロジック (純関数)
 *
 * ここで扱うのは2種類の値で、UI 上の扱いを混ぜないこと:
 *  - 事実: 必要マイル数・年会費・還元率 (公式サイト転記。data.ts が出所を保証)
 *  - 推計: 「月◯円の決済で◯ヶ月」(利用者が入力した前提から計算した見積もり)
 * 推計は前提を必ず併記して表示する。
 */

export type AwardRequirement = {
  programId: string;
  programName: string;
  /** 往復に必要なマイル。JAL は片道基本マイル×2 で正規化 */
  roundTripMiles: { economy: RangeOrExact; business: RangeOrExact | null };
  /**
   * マイル発券時の手出し現金 (燃油サーチャージ往復分)。
   * 燃油は2ヶ月ごとに改定されるため、公表期間外は null になり金額を出さない。
   * 空港税等の諸税は経路依存で単一の数字として検証できないため、金額は持たず
   * caveats の「諸税別途」でのみ伝える。
   */
  fuelSurcharge: {
    roundTripYen: number;
    label: string;
    validUntil: string;
    source: string;
  } | null;
  /** 表示上の注意 (変動制・シーズン・サーチャージ) */
  caveats: string[];
  source: string;
  verifiedAt: string;
};

export type RangeOrExact =
  | { kind: "range"; min: number; max: number; label: string }
  | { kind: "from"; min: number; label: string };

function fmt(n: number): string {
  return n.toLocaleString("ja-JP");
}

/**
 * 目的地 × プログラム → 燃油サーチャージ (往復 = 片道区間 × 2)。
 * 公表期間 (validFrom〜validUntil) 外の日付では null を返す。
 * 期限切れの燃油額を出すと事実と異なる金額表示になるため、勝手に据え置かない。
 */
export function fuelSurchargeFor(
  destination: MileDestination,
  program: MileProgram,
  today: string
): AwardRequirement["fuelSurcharge"] {
  const fs = program.fuelSurcharge;
  if (!fs) return null;
  if (today < fs.validFrom || today > fs.validUntil) return null;
  const codes = new Set(destination.destinationCodes);
  const band = fs.bands.find((b) => b.destinationCodes.some((c) => codes.has(c)));
  if (!band) return null;
  const roundTrip = band.oneWayYen * 2;
  const until = fs.validUntil.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$1/$2/$3");
  return {
    roundTripYen: roundTrip,
    label: `燃油 ¥${fmt(roundTrip)} (往復・${until}発券分まで)`,
    validUntil: fs.validUntil,
    source: fs.source,
  };
}

/** 目的地 × プログラム → 往復必要マイル (取れない場合は null) */
export function awardRequirementFor(
  destination: MileDestination,
  program: MileProgram,
  /** 燃油の適用判定に使う今日の日付 (YYYY-MM-DD)。テスト可能にするため引数で受ける */
  today?: string
): AwardRequirement | null {
  const surcharge = today ? fuelSurchargeFor(destination, program, today) : null;
  const surchargeCaveat = surcharge
    ? "空港税等の諸税が別途必要 (経路により変動、予約時に表示)"
    : "燃油サーチャージ・空港税等の諸税は別途現金で必要 (最新額は公式で確認)";

  if (program.chartType === "zone-season") {
    if (!destination.anaZoneId) return null;
    const zone = program.zones?.find((z) => z.zoneId === destination.anaZoneId);
    if (!zone) return null;
    const eco = zone.roundTripMiles.economy;
    const biz = zone.roundTripMiles.business;
    return {
      programId: program.id,
      programName: program.name,
      roundTripMiles: {
        economy: {
          kind: "range",
          min: eco.low,
          max: eco.high,
          label: `${fmt(eco.low)}〜${fmt(eco.high)}マイル`,
        },
        business: {
          kind: "range",
          min: biz.low,
          max: biz.high,
          label: `${fmt(biz.low)}〜${fmt(biz.high)}マイル`,
        },
      },
      fuelSurcharge: surcharge,
      caveats: [
        "シーズン (L/R/H) により変動。幅の下限がローシーズン、上限がハイシーズン",
        surchargeCaveat,
      ],
      source: program.source,
      verifiedAt: program.verifiedAt,
    };
  }

  // JAL: 片道基本マイル × 2 を往復の目安とする。満席時は PLUS で増える変動制
  if (!destination.jalRouteId) return null;
  const route = program.routes?.find((r) => r.routeId === destination.jalRouteId);
  if (!route) return null;
  const eco = route.oneWayBasicMiles.economy * 2;
  const biz = route.oneWayBasicMiles.business * 2;
  return {
    programId: program.id,
    programName: program.name,
    roundTripMiles: {
      economy: { kind: "from", min: eco, label: `${fmt(eco)}マイル〜` },
      business: { kind: "from", min: biz, label: `${fmt(biz)}マイル〜` },
    },
    fuelSurcharge: surcharge,
    caveats: [
      `片道の基本マイル数 (エコノミー${fmt(route.oneWayBasicMiles.economy)}) × 2 の目安。基本マイル数の席が満席の場合「特典航空券PLUS」で必要マイルが増える`,
      ...(route.notes ? [route.notes] : []),
      surchargeCaveat,
    ],
    source: program.source,
    verifiedAt: program.verifiedAt,
  };
}

export type EarnEstimate = {
  cardId: string;
  /** 月間マイル獲得数 (前提: monthlySpendYen を全て対象決済に使う) */
  milesPerMonth: number;
  /** 目標マイルへの到達月数 (切り上げ)。還元率が引けないカードは null */
  monthsToTarget: number | null;
  /** 適用した還元率のラベル (有料オプション込みかを明示) */
  earningLabel: string;
  /** 年間コスト = 年会費 + 有料オプション */
  annualCostYen: number;
};

/**
 * カード × 月間決済額 × 目標マイル → 到達月数の推計。
 * 最有利な還元 (有料オプション加入前提) で計算し、その前提をラベルで返す。
 */
export function estimateEarn(
  card: MileCard,
  monthlySpendYen: number,
  targetMiles: number
): EarnEstimate | null {
  if (!card.mileEarning) return null;
  const boosted = card.mileEarning.boosted;
  const base = card.mileEarning.base;

  let milesPerMonth: number;
  let earningLabel: string;
  let optionFee = 0;

  if (boosted?.yenPerMile) {
    milesPerMonth = Math.floor(monthlySpendYen / boosted.yenPerMile);
    earningLabel = `${boosted.label} (${boosted.optionName}加入時)`;
    optionFee = boosted.optionFeeYen ?? 0;
  } else if (boosted && boosted.yenPerMile === null && boosted.label.includes("1.125%")) {
    // セゾンプラチナ: 還元率表記 (1.125%) のみ公式が示すケース
    milesPerMonth = Math.floor(monthlySpendYen * 0.01125);
    earningLabel = `${boosted.label} (${boosted.optionName}加入時)`;
    optionFee = boosted.optionFeeYen ?? 0;
  } else if (base) {
    milesPerMonth = Math.floor(monthlySpendYen / base.yenPerMile);
    earningLabel = base.label;
  } else {
    return null;
  }

  return {
    cardId: card.id,
    milesPerMonth,
    monthsToTarget:
      milesPerMonth > 0 ? Math.ceil(targetMiles / milesPerMonth) : null,
    earningLabel,
    annualCostYen: card.annualFeeYen + optionFee,
  };
}

/**
 * 推奨カードの並び順。
 * マイル効率 (月間獲得数) → 年間コストの昇順だけで決める。
 * アフィリエイトの有無を順位に影響させないこと (収益より信頼が先)。
 */
export function rankCards<T extends MileCard>(
  cards: T[],
  programId: string | null,
  monthlySpendYen: number,
  targetMiles: number,
  wantsLounge: boolean
): { card: T; estimate: EarnEstimate | null }[] {
  const scored = cards
    .filter((c) => {
      if (programId && c.programId && c.programId !== programId) return false;
      return true;
    })
    .map((card) => ({
      card,
      estimate: estimateEarn(card, monthlySpendYen, targetMiles),
    }));

  return scored.sort((a, b) => {
    // ラウンジ希望時は PP 対応カードを先頭グループに
    if (wantsLounge) {
      const ppA = a.card.lounge?.priorityPass ? 1 : 0;
      const ppB = b.card.lounge?.priorityPass ? 1 : 0;
      if (ppA !== ppB) return ppB - ppA;
    }
    const ma = a.estimate?.milesPerMonth ?? -1;
    const mb = b.estimate?.milesPerMonth ?? -1;
    if (ma !== mb) return mb - ma;
    return a.card.annualFeeYen - b.card.annualFeeYen;
  });
}
