"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Plane, CreditCard, Armchair, BadgeCheck, Coins } from "lucide-react";
import type {
  MileCard,
  MileDestination,
  PriorityPassPricing,
  TransferRoute,
} from "@/lib/miles/data";
import type { AwardRequirement } from "@/lib/miles/simulator";
import {
  destinationSummary,
  milesForSeason,
  ppCostComparison,
  rankCards,
  SEASON_LABELS,
  type Season,
} from "@/lib/miles/simulator";
import { trackPartnerClick } from "@/components/analytics";

/** サーバー側で解決済みの、目的地ごとの表示データ */
export type SimDestination = {
  destination: MileDestination;
  awards: AwardRequirement[];
  /** 実ディールの最安 (観測が無い目的地は null。埋めない) */
  cheapestDeal: {
    id: string;
    airlineName: string;
    totalCost: number;
    departureDate: string;
    returnDate: string;
  } | null;
};

export type SimCard = MileCard & {
  /** サーバーで解決した提携リンク (env 未設定なら null → 公式リンク) */
  affiliateUrl: string | null;
};

const SPEND_PRESETS = [30000, 50000, 100000, 200000] as const;

function yen(n: number): string {
  return `¥${n.toLocaleString("ja-JP")}`;
}

export function MileSimulator({
  items,
  cards,
  ppPricing,
  transferRoutes,
  verifiedAt,
  initialDestId,
}: {
  items: SimDestination[];
  cards: SimCard[];
  ppPricing: PriorityPassPricing;
  transferRoutes: TransferRoute[];
  verifiedAt: string;
  /** 遷移元 (ディール等) から都市をプリセットする。無効値は無視して先頭都市 */
  initialDestId?: string;
}) {
  const defaultDestId =
    (initialDestId && items.some((i) => i.destination.id === initialDestId)
      ? initialDestId
      : items[0]?.destination.id) ?? "";
  const [destId, setDestId] = useState(defaultDestId);
  const [spend, setSpend] = useState<number>(50000);
  const [cabin, setCabin] = useState<"economy" | "business">("economy");
  const [wantsLounge, setWantsLounge] = useState(false);
  // 渡航シーズン。ANA はシーズン制のため試算目標が変わる。既定は最も代表的な
  // レギュラー (以前は下限=ロー固定で甘い側に寄っていた)。JAL は基本マイル固定。
  const [season, setSeason] = useState<Season>("regular");
  const [ppVisits, setPpVisits] = useState<number>(4);

  const current = useMemo(
    () => items.find((i) => i.destination.id === destId) ?? items[0],
    [items, destId]
  );

  // 到達月数の目標: 選択キャビン×シーズンの必要マイルのうち少ない方
  // (ANA はシーズン値、JAL は基本マイル)。前提はUIに必ず明示する。
  const targetMiles = useMemo(() => {
    const vals = current.awards
      .map((a) => milesForSeason(a, cabin, season))
      .filter((n): n is number => typeof n === "number");
    return vals.length ? Math.min(...vals) : null;
  }, [current, cabin, season]);

  const ranked = useMemo(() => {
    if (!targetMiles) return [];
    return rankCards(cards, null, spend, targetMiles, wantsLounge);
  }, [cards, spend, targetMiles, wantsLounge]);

  return (
    <div className="space-y-8">
      {/* ── 入力 ── */}
      <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-5">
        <div>
          <div className="text-xs font-medium text-zinc-500 mb-2">目的地</div>
          <div className="flex flex-wrap gap-2">
            {items.map((i) => (
              <button
                key={i.destination.id}
                onClick={() => setDestId(i.destination.id)}
                className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
                  i.destination.id === current.destination.id
                    ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                {i.destination.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="text-xs font-medium text-zinc-500 mb-2">
              月間のカード決済額 (生活費など)
            </div>
            <div className="flex flex-wrap gap-2">
              {SPEND_PRESETS.map((v) => (
                <button
                  key={v}
                  onClick={() => setSpend(v)}
                  className={`rounded-lg px-3 py-1.5 text-sm border transition-colors ${
                    spend === v
                      ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {yen(v)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-500 mb-2">座席クラス</div>
            <div className="flex gap-2">
              {(
                [
                  ["economy", "エコノミー"],
                  ["business", "ビジネス"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setCabin(key)}
                  className={`rounded-lg px-3 py-1.5 text-sm border transition-colors ${
                    cabin === key
                      ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-500 mb-2">渡航シーズン</div>
            <div className="flex flex-wrap gap-2">
              {(["low", "regular", "high"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setSeason(key)}
                  className={`rounded-lg px-3 py-1.5 text-sm border transition-colors ${
                    season === key
                      ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                      : "border-zinc-200 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {key === "low" ? "ロー" : key === "regular" ? "レギュラー" : "ハイ"}
                </button>
              ))}
            </div>
            <p className="mt-1 text-[10px] text-zinc-400">
              ANAのシーズン制に対応。JALは基本マイル固定 (満席時に変動)
            </p>
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-500 mb-2">空港ラウンジ</div>
            <button
              onClick={() => setWantsLounge((v) => !v)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm border transition-colors ${
                wantsLounge
                  ? "bg-violet-600 text-white border-violet-600"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
              }`}
            >
              <Armchair className="h-4 w-4" />
              プライオリティ・パスを使いたい
            </button>
          </div>
        </div>
      </div>

      {/* ── 現金 vs マイル ── */}
      <div>
        <h2 className="font-heading text-lg tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-3">
          {current.destination.label}: 現金セール vs マイル
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/20 p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-2">
              <Plane className="h-4 w-4" />
              現金で買う (観測中のセール最安)
            </div>
            {current.cheapestDeal ? (
              <>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {yen(current.cheapestDeal.totalCost)}
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  {current.cheapestDeal.airlineName} ·{" "}
                  {current.cheapestDeal.departureDate.slice(5).replace("-", "/")}発〜
                  {current.cheapestDeal.returnDate.slice(5).replace("-", "/")}帰着
                </div>
                <Link
                  href={`/deals/${current.cheapestDeal.id}`}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:underline"
                >
                  このディールを見る
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </>
            ) : (
              <div className="text-sm text-zinc-500">
                現在この目的地のセールは観測されていません。
                <Link href="/deals" className="ml-1 underline">
                  ディール一覧
                </Link>
                で他の目的地を確認できます。
              </div>
            )}
          </div>

          {current.awards.map((a) => {
            const miles = a.roundTripMiles[cabin];
            return (
              <div
                key={a.programId}
                className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
              >
                <div className="flex items-center gap-2 flex-wrap text-xs font-medium text-zinc-500 mb-2">
                  <BadgeCheck className="h-4 w-4" />
                  {a.programName} 特典航空券 (往復)
                  {a.alliance && (
                    <span className="rounded bg-indigo-100 dark:bg-indigo-900/40 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:text-indigo-300">
                      {a.alliance.name}
                    </span>
                  )}
                </div>
                {miles ? (
                  <>
                    {a.seasonMiles ? (
                      <div>
                        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                          {a.seasonMiles[cabin][season].toLocaleString("ja-JP")}
                          <span className="text-sm font-normal text-zinc-500 ml-1">
                            マイル ({SEASON_LABELS[season]})
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          シーズン幅: {miles.label}
                        </div>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        {miles.label}
                      </div>
                    )}
                    {a.fuelSurcharge && (
                      <div className="mt-1 text-sm font-medium text-amber-700 dark:text-amber-400">
                        + 手出し現金 {a.fuelSurcharge.label}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-zinc-500">このクラスの設定なし</div>
                )}
                <ul className="mt-2 space-y-1">
                  {a.caveats.map((c, i) => (
                    <li key={i} className="text-[11px] leading-relaxed text-zinc-400">
                      ・{c}
                    </li>
                  ))}
                </ul>
                <a
                  href={a.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-[11px] text-zinc-400 underline"
                >
                  公式チャートを確認 ({a.verifiedAt}時点)
                </a>
              </div>
            );
          })}
          {current.awards.length === 0 && (
            <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 text-sm text-zinc-500 md:col-span-2">
              この目的地の特典航空券データは未収録です。
            </div>
          )}
        </div>
        {(() => {
          const s = destinationSummary(current.awards, cabin);
          if (!s) return null;
          return (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
              必要マイルの下限が少ないのは <strong>{s.programName}</strong> (
              {s.minMiles.toLocaleString("ja-JP")}マイル
              {s.fuelYen ? ` + 燃油 ¥${s.fuelYen.toLocaleString("ja-JP")}` : ""})。
              {s.allianceName && (
                <>
                  {s.programName.includes("ANA") ? "ANA" : "JAL"}マイルは
                  <strong>{s.allianceName}</strong>系のポイント・カードから貯めるのが近道です。
                </>
              )}
              <span className="block mt-1 text-xs text-zinc-400">
                ※どちらが「得」かはマイルの貯めやすさ (お手持ちのカード) 次第です。下の試算で比較してください。
              </span>
            </p>
          );
        })()}
      </div>

      {/* ── カードで貯める推計 ── */}
      {targetMiles && (
        <div>
          <h2 className="font-heading text-lg tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-1">
            カード決済でいつ貯まる？
          </h2>
          <p className="text-xs text-zinc-500 mb-3">
            前提: 月{yen(spend)}を対象決済に使い、目標は
            {current.destination.label}往復{cabin === "economy" ? "エコノミー" : "ビジネス"}の
            必要マイル ({targetMiles.toLocaleString("ja-JP")}マイル ・ ANAは
            {SEASON_LABELS[season]}、JALは基本マイルで計算)。あくまで入力した前提から計算した推計です。
          </p>
          <div className="space-y-3">
            {ranked.map(({ card, estimate }, idx) => {
              const href = card.affiliateUrl ?? card.officialUrl;
              const isAffiliate = card.affiliateUrl !== null;
              return (
                <div
                  key={card.id}
                  className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-zinc-400">#{idx + 1}</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {card.name}
                      </span>
                      {card.lounge?.priorityPass && (
                        <span className="rounded bg-violet-100 dark:bg-violet-900/40 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 dark:text-violet-300">
                          プライオリティ・パス
                        </span>
                      )}
                      {isAffiliate && (
                        <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">
                          PR
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      年会費{yen(card.annualFeeYen)}
                      {card.annualFeeNote ? ` (${card.annualFeeNote})` : ""}
                      {estimate ? ` ・ ${estimate.earningLabel}` : ""}
                      {card.mileEarningNote ? ` ・ ${card.mileEarningNote}` : ""}
                    </div>
                    {card.lounge && (
                      <div className="mt-1 text-[11px] text-zinc-400">{card.lounge.detail}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {estimate?.monthsToTarget ? (
                      <div className="text-right">
                        <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                          約{estimate.monthsToTarget}ヶ月
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          月{estimate.milesPerMonth.toLocaleString("ja-JP")}マイル獲得の推計
                        </div>
                      </div>
                    ) : (
                      <div className="text-right text-[11px] text-zinc-400 max-w-[140px]">
                        マイル還元の数値が公式で確認できないため推計対象外
                      </div>
                    )}
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      onClick={() =>
                        trackPartnerClick({
                          partnerId: card.id,
                          category: "credit-card",
                          source: "mile-simulator",
                          placement: "pill",
                        })
                      }
                      className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:border-zinc-400 transition-colors inline-flex items-center gap-1"
                    >
                      {isAffiliate ? "詳細を見る" : "公式サイト"}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-zinc-400 flex items-start gap-1">
            <CreditCard className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            並び順はマイル獲得効率と年会費で決めています (提携の有無は順位に影響しません)。
            カード情報は{verifiedAt}時点の公式サイト表示に基づきます。最新の条件・入会特典は必ず公式サイトでご確認ください。
          </p>
        </div>
      )}

      {/* ── 手持ちポイントの移行先 ── */}
      {targetMiles && transferRoutes.length > 0 && (
        <div>
          <h2 className="font-heading text-lg tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-1">
            手持ちのポイントはどちらのマイルに変える？
          </h2>
          <p className="text-xs text-zinc-500 mb-3">
            {current.destination.label}往復
            {cabin === "economy" ? "エコノミー" : "ビジネス"} (ANAは{SEASON_LABELS[season]}、
            JALは基本マイル) に届くまでに必要なポイント数の換算です。
            交換レートは各社の公式ページで確認した現行値 ({verifiedAt}時点)。
          </p>
          <div className="space-y-3">
            {Object.entries(
              transferRoutes.reduce<Record<string, TransferRoute[]>>((acc, r) => {
                (acc[r.pointName] ??= []).push(r);
                return acc;
              }, {})
            ).map(([pointName, routes]) => {
              // 同じポイントで ANA/JAL のどちらが少ないポイントで届くかを比較
              const withNeed = routes
                .map((r) => {
                  const award = current.awards.find((a) => a.programId === r.programId);
                  if (!award) return null;
                  const need = milesForSeason(award, cabin, season);
                  if (!need) return null;
                  return {
                    route: r,
                    needPoints: Math.ceil(need / (r.rate.miles / r.rate.points)),
                    programName: award.programName,
                    allianceName: award.alliance?.name ?? null,
                  };
                })
                .filter((x): x is NonNullable<typeof x> => x !== null)
                .sort((a, b) => a.needPoints - b.needPoints);
              if (withNeed.length === 0) return null;
              const best = withNeed[0];
              return (
                <div
                  key={pointName}
                  className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-5"
                >
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Coins className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{pointName}</span>
                    <span className="text-[11px] text-zinc-400">{best.route.issuer}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {withNeed.map((w, i) => (
                      <div
                        key={w.route.id}
                        className={`rounded-xl px-3 py-2 border ${
                          i === 0 && withNeed.length > 1
                            ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/60 dark:bg-emerald-900/20"
                            : "border-zinc-100 dark:border-zinc-800"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                            {w.programName}
                          </span>
                          {i === 0 && withNeed.length > 1 && (
                            <span className="rounded bg-emerald-600 text-white px-1.5 py-0.5 text-[10px] font-medium">
                              少ないポイントで届く
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                          {w.needPoints.toLocaleString("ja-JP")}
                          <span className="text-xs font-normal text-zinc-400 ml-1">ポイント必要</span>
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {w.route.rateLabel}
                          {w.allianceName ? ` ・ ${w.allianceName}` : ""}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-1">{w.route.notes}</div>
                        <a
                          href={w.route.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-block text-[11px] text-zinc-400 underline"
                        >
                          公式の交換条件
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-zinc-400">
            ここに無いポイント (Vポイント・アメックスのメンバーシップ・リワード・JCB Oki Doki 等) は、
            公式の交換条件を確認できたものから順次追加します。確認できていないレートは掲載していません。
          </p>
        </div>
      )}

      {/* ── プライオリティ・パス比較 ── */}
      <div className="rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50/40 dark:bg-violet-900/10 p-5">
        <h2 className="font-heading text-lg tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-1 flex items-center gap-2">
          <Armchair className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          プライオリティ・パスはどう持つのが安い？
        </h2>
        <p className="text-xs text-zinc-500 mb-3">
          {ppPricing.network?.label ?? "世界中の空港ラウンジに入れる会員制度"}。
          直接入会するよりカード付帯のほうが安く済むことが多く、年間の利用回数で最適解が変わります。
          料金・特典は{ppPricing.verifiedAt}時点の
          <a href={ppPricing.source} target="_blank" rel="noopener noreferrer" className="underline mx-0.5">
            公式サイト
          </a>
          の表示です。
        </p>
        {ppPricing.benefits && (
          <div className="mb-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 px-4 py-3">
            <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-2">
              ラウンジ1回でできること
              <span className="ml-2 font-normal text-zinc-400">
                (都度払いなら1回 US${ppPricing.plans.find((pl) => pl.id === "standard")?.visitFeeUsd ?? 35} の価値)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ppPricing.benefits.items.map((b) => (
                <span
                  key={b}
                  className="rounded-full bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800 px-2.5 py-1 text-[11px] text-violet-700 dark:text-violet-300"
                >
                  {b}
                </span>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-zinc-400">{ppPricing.benefits.caveat}</p>
          </div>
        )}
        <div className="mb-4">
          <div className="text-xs font-medium text-zinc-500 mb-2">年間何回ラウンジを使いそう？ (同伴者を除く本人分)</div>
          <div className="flex flex-wrap gap-2">
            {[2, 4, 8, 15].map((v) => (
              <button
                key={v}
                onClick={() => setPpVisits(v)}
                className={`rounded-lg px-3 py-1.5 text-sm border transition-colors ${
                  ppVisits === v
                    ? "bg-violet-600 text-white border-violet-600"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                年{v}回
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {ppCostComparison(ppVisits, ppPricing, cards).map((row) => (
            <div
              key={row.id}
              className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 px-4 py-3"
            >
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{row.name}</span>
                <span className="block text-[11px] text-zinc-400">{row.note}</span>
              </div>
              <div className="text-right shrink-0 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {row.costJpy !== null && `年会費 ¥${row.costJpy.toLocaleString("ja-JP")}`}
                {row.costJpy !== null && row.costUsd !== null && " + "}
                {row.costUsd !== null && `US$${row.costUsd.toLocaleString("ja-JP")}`}
                {row.costJpy === null && row.costUsd === null && "¥0"}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-zinc-400">
          例: プレステージ (本人無制限) を直接契約すると年US$469。同等のプレステージ相当が付帯する
          セゾンプラチナは年会費¥33,000で、ラウンジ以外の特典 (コンシェルジュ・旅行保険など) も付きます。
          カード付帯分の年会費はカード自体の特典も含んだ金額であり、ラウンジ単体の対価ではありません。
          為替換算はご自身のレートでご確認ください (通貨をまたぐ合算はしていません)。
        </p>
      </div>
    </div>
  );
}
