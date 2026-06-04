import { Globe, Plug, Clock, Shield, Wifi, Coins, Plane, Briefcase, Package } from "lucide-react";
import type { CityPracticalInfo } from "@/data/city-practical-info";

/**
 * /hotels/[city] サイドバー: 渡航者の実用情報パネル。
 * 表示する情報自体が滞在時間と信頼性を上げると同時に、
 * Wi-Fi=spotty/limited や insuranceRecommended=high の都市では
 * 自然と eSIM/旅行保険/空港送迎クロスセルへの動機が生まれる。
 */

const SAFETY_BADGE: Record<CityPracticalInfo["safety"]["level"], { label: string; cls: string }> = {
  "very-safe": { label: "非常に安全", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200" },
  safe: { label: "概ね安全", cls: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200" },
  moderate: { label: "通常の注意", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200" },
  caution: { label: "要注意", cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200" },
};

const WIFI_LABEL: Record<CityPracticalInfo["wifi"]["public"], string> = {
  excellent: "公共 Wi-Fi 充実",
  good: "公共 Wi-Fi あり",
  spotty: "Wi-Fi まばら",
  limited: "Wi-Fi 限定的",
};

const TIPPING_LABEL: Record<CityPracticalInfo["tipping"], string> = {
  expected: "チップ必須",
  appreciated: "チップ歓迎",
  "not-customary": "チップ不要",
};

const INSURANCE_LABEL: Record<CityPracticalInfo["insuranceRecommended"], { label: string; cls: string }> = {
  low: { label: "推奨度: 低", cls: "text-zinc-500" },
  medium: { label: "推奨度: 中", cls: "text-amber-600 dark:text-amber-300" },
  high: { label: "推奨度: 高", cls: "text-rose-600 dark:text-rose-300" },
};

export function CityPracticalCard({
  info,
  cityNameJa,
}: {
  info: CityPracticalInfo;
  cityNameJa: string;
}) {
  const safety = SAFETY_BADGE[info.safety.level];
  const insurance = INSURANCE_LABEL[info.insuranceRecommended];
  const offsetSign = info.timeDiffHours > 0 ? "+" : info.timeDiffHours < 0 ? "" : "±";

  return (
    <aside className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <header className="border-b border-zinc-100 dark:border-zinc-800 px-5 py-3">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {cityNameJa}の旅行ハンドブック
        </h3>
        <p className="text-[11px] text-zinc-500 mt-0.5">
          渡航前に押さえておきたい実用情報
        </p>
      </header>

      <dl className="divide-y divide-zinc-100 dark:divide-zinc-800 text-[12px]">
        <Row
          Icon={Coins}
          label="通貨"
          value={
            <>
              {info.currency.code} ({info.currency.symbol})
              {info.currency.perUnitJpy != null && (
                <span className="text-zinc-400 ml-1">
                  1{info.currency.symbol} ≒ ¥{info.currency.perUnitJpy}
                </span>
              )}
            </>
          }
        />
        <Row
          Icon={Globe}
          label="言語"
          value={
            <>
              {info.language.primary}
              <span className="text-zinc-400 ml-1">
                · 英語通用度 {info.language.englishOk === "high" ? "高" : info.language.englishOk === "medium" ? "中" : "低"}
              </span>
            </>
          }
        />
        <Row
          Icon={Plug}
          label="電圧/プラグ"
          value={
            <>
              {info.power.voltage}
              <span className="text-zinc-400 ml-1">
                · タイプ {info.power.plugTypes.join("/")}
              </span>
            </>
          }
        />
        <Row
          Icon={Clock}
          label="時差"
          value={
            info.timeDiffHours === 0
              ? "日本と同じ"
              : `日本 ${offsetSign}${info.timeDiffHours}時間`
          }
        />
        <Row
          Icon={Shield}
          label="治安"
          value={
            <span className="inline-flex flex-col gap-0.5">
              <span className={`inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-bold ${safety.cls}`}>
                {safety.label}
              </span>
              {info.safety.note && (
                <span className="text-zinc-500 text-[11px]">{info.safety.note}</span>
              )}
            </span>
          }
        />
        <Row
          Icon={Wifi}
          label="Wi-Fi"
          value={
            <>
              {WIFI_LABEL[info.wifi.public]}
              {info.wifi.esimRecommended && (
                <span className="block text-rose-500 text-[11px] mt-0.5 font-bold">
                  → eSIM 推奨
                </span>
              )}
            </>
          }
        />
        <Row
          Icon={Coins}
          label="チップ"
          value={TIPPING_LABEL[info.tipping]}
        />
        <Row
          Icon={Plane}
          label="空港アクセス"
          value={
            <>
              {info.airportAccess.mode}
              <span className="text-zinc-400 block text-[11px]">
                約{info.airportAccess.durationMin}分 / {info.airportAccess.costJpy}
              </span>
            </>
          }
        />
        <Row
          Icon={Briefcase}
          label="旅行保険"
          value={
            <span className={`font-bold ${insurance.cls}`}>{insurance.label}</span>
          }
        />
        <Row
          Icon={Clock}
          label="推奨滞在"
          value={info.recommendedDays}
        />
        {info.packingTips.length > 0 && (
          <li className="px-5 py-3 list-none">
            <div className="flex items-start gap-2">
              <Package className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-zinc-400" />
              <div className="min-w-0">
                <p className="text-zinc-500 text-[11px] font-bold mb-1">持ち物のヒント</p>
                <ul className="space-y-0.5 text-[11px] text-zinc-700 dark:text-zinc-300">
                  {info.packingTips.map((t, i) => (
                    <li key={i} className="before:content-['·'] before:mr-1.5 before:text-zinc-400">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        )}
      </dl>
    </aside>
  );
}

function Row({
  Icon,
  label,
  value,
}: {
  Icon: typeof Globe;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 px-5 py-2.5">
      <Icon className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-zinc-400" />
      <div className="min-w-0 flex-1">
        <dt className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          {label}
        </dt>
        <dd className="text-zinc-700 dark:text-zinc-200 mt-0.5">{value}</dd>
      </div>
    </div>
  );
}
