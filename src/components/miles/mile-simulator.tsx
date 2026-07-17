"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Plane, CreditCard, Armchair, BadgeCheck } from "lucide-react";
import type { MileCard, MileDestination, PriorityPassPricing } from "@/lib/miles/data";
import type { AwardRequirement } from "@/lib/miles/simulator";
import { destinationSummary, ppCostComparison, rankCards } from "@/lib/miles/simulator";
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
  verifiedAt,
}: {
  items: SimDestination[];
  cards: SimCard[];
  ppPricing: PriorityPassPricing;
  verifiedAt: string;
}) {
  const [destId, setDestId] = useState(items[0]?.destination.id ?? "");
  const [spend, setSpend] = useState<number>(50000);
  const [cabin, setCabin] = useState<"economy" | "business">("economy");
  const [wantsLounge, setWantsLounge] = useState(false);
  const [ppVisits, setPpVisits] = useState<number>(4);

  const current = useMemo(
    () => items.find((i) => i.destination.id === destId) ?? items[0],
    [items, destId]
  );

  // 到達月数の目標: 選択キャビンの必要マイル下限 (= ローシーズン/基本マイル)。
  // 甘い側の前提なので、表示側で「最短・ローシーズン利用時」と必ず明示する。
  const targetMiles = useMemo(() => {
    const mins = current.awards
      .map((a) => a.roundTripMiles[cabin]?.min)
      .filter((n): n is number => typeof n === "number");
    return mins.length ? Math.min(...mins) : null;
  }, [current, cabin]);

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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      {miles.label}
                    </div>
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
            必要マイル下限 ({targetMiles.toLocaleString("ja-JP")}マイル
            ・ローシーズン/基本マイル利用時)。あくまで入力した前提から計算した推計です。
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

      {/* ── プライオリティ・パス比較 ── */}
      <div className="rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50/40 dark:bg-violet-900/10 p-5">
        <h2 className="font-heading text-lg tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-1 flex items-center gap-2">
          <Armchair className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          プライオリティ・パスはどう持つのが安い？
        </h2>
        <p className="text-xs text-zinc-500 mb-4">
          世界1,700カ所以上の空港ラウンジに入れる会員制度。直接入会するより
          カード付帯のほうが安く済むことが多く、年間の利用回数で最適解が変わります。
          料金は{ppPricing.verifiedAt}時点の
          <a href={ppPricing.source} target="_blank" rel="noopener noreferrer" className="underline mx-0.5">
            公式サイト
          </a>
          の表示です。
        </p>
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
