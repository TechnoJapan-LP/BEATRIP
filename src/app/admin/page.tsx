import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { Header } from "@/components/header";
import { SiteFooter } from "@/components/site-footer";
import {
  Database,
  Plane,
  Users,
  MailOpen,
  BellRing,
  TrendingUp,
  Server,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { loadAllSales, type StoredSaleData } from "@/lib/store/sale-store";
import { listSubscribers } from "@/lib/newsletter/store";
import { listAlerts } from "@/lib/price-alerts/store";
import {
  loadAllClickStats,
  loadPlacementBreakdown,
} from "@/lib/store/click-store";
import { airlines } from "@/data/airlines";
import { getAirlineAffiliateEnvStatus } from "@/lib/affiliate/url-builder";
import { isKVEnabled } from "@/lib/store/kv";
import { NewsletterDigestButton } from "@/components/admin/newsletter-digest-button";
import { HotelPhotosRefreshButton } from "@/components/admin/hotel-photos-refresh-button";
import { TotpInput } from "@/components/admin/totp-input";
import { verifySessionToken } from "@/lib/auth/totp";
import { listRecentAuditLogs } from "@/lib/audit/audit-log";

export const metadata: Metadata = {
  title: "Admin Dashboard | BEATRIP",
  robots: { index: false, follow: false },
  // /admin?token=XXX を URL で受け取るため、外部リンクへの遷移時に
  // Referer ヘッダで token が漏れないよう "no-referrer" を強制する。
  referrer: "no-referrer",
};

// 常に dynamic (認証 + 最新データ表示)
export const dynamic = "force-dynamic";

/**
 * /admin — 運用ダッシュボード (認証必須、本番非公開)
 *
 * 認証方式:
 *   1. ADMIN_API_KEY を Cookie `beatrip_admin` / `Authorization: Bearer` / `?token=`
 *   2. ADMIN_TOTP_SECRET が設定されていれば追加で TOTP (2FA) 必須
 *      → cookie `beatrip_admin_2fa` の HMAC 署名 token を検証
 *      → 未設定なら 2FA フローは skip (既存挙動互換)
 */
async function checkPrimaryAuth(): Promise<boolean> {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) return false;
  const cookieStore = await cookies();
  if (cookieStore.get("beatrip_admin")?.value === expected) return true;
  const headerStore = await headers();
  return headerStore.get("authorization") === `Bearer ${expected}`;
}

async function check2FA(): Promise<boolean> {
  const adminKey = process.env.ADMIN_API_KEY;
  const totpSecret = process.env.ADMIN_TOTP_SECRET;
  // 2FA 未設定なら常に pass (既存挙動互換)
  if (!adminKey || !totpSecret) return true;
  const cookieStore = await cookies();
  const sess = cookieStore.get("beatrip_admin_2fa")?.value;
  if (!sess) return false;
  return verifySessionToken(`${adminKey}:${totpSecret}`, sess);
}

function fmt(n: number) {
  return new Intl.NumberFormat("ja-JP").format(n);
}
function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("ja-JP"); } catch { return iso; }
}
function statusColor(date: string | null | undefined): string {
  if (!date) return "text-zinc-400";
  const ageH = (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60);
  if (ageH < 24) return "text-emerald-600 dark:text-emerald-400";
  if (ageH < 72) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const sp = await searchParams;
  const expected = process.env.ADMIN_API_KEY;
  const totpEnabled = Boolean(expected && process.env.ADMIN_TOTP_SECRET);
  const primaryAuthed =
    (await checkPrimaryAuth()) || (expected != null && sp.token === expected);

  if (!primaryAuthed) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-md px-4 py-20 sm:px-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <h1 className="font-heading text-2xl uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
              Admin
            </h1>
            <p className="mt-4 text-sm text-zinc-500">
              ADMIN_API_KEY が必要です。
              <br />
              <code className="rounded bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
                /admin?token=XXXXX
              </code>
            </p>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  // 2FA チェック (ADMIN_TOTP_SECRET が設定されていれば必須)
  const twoFAOk = await check2FA();
  if (!twoFAOk && expected) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-md px-4 py-20 sm:px-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
            <h1 className="flex items-center justify-center gap-2 font-heading text-2xl uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              2FA 認証
            </h1>
            <p className="mt-3 text-center text-xs text-zinc-500">
              認証アプリの 6 桁コードを入力してください。
              <br />
              成功すると 10 分間 cookie で記憶されます。
            </p>
            <div className="mt-6">
              <TotpInput token={expected} />
            </div>
            <p className="mt-4 text-center text-[10px] text-zinc-400">
              初回設定は <a className="underline" href={`/admin/setup-2fa?token=${encodeURIComponent(expected)}`}>/admin/setup-2fa</a>
            </p>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  // 認証済 → 各種統計を並列取得
  const [allSales, subscribers, alerts, clickStats, auditLogs, placementBreakdown] =
    await Promise.all([
      loadAllSales().catch(() => ({} as Record<string, StoredSaleData>)),
      listSubscribers().catch(() => [] as string[]),
      listAlerts().catch(() => []),
      loadAllClickStats().catch(() => []),
      listRecentAuditLogs(20, 7).catch(() => []),
      loadPlacementBreakdown().catch(
        () => [] as { placement: string; clicks: number }[]
      ),
    ]);

  const placementTotal = placementBreakdown.reduce((s, p) => s + p.clicks, 0);

  const totalActiveSales = Object.values(allSales).reduce(
    (s, v) => s + v.sales.length,
    0
  );
  const totalClicks = clickStats.reduce((s, c) => s + c.total_clicks, 0);

  const airlineRows = airlines.map((a) => {
    const data = allSales[a.code] ?? { sales: [], lastScraped: "", history: [] };
    const lastErr = data.history?.slice().reverse().find((h) => !h.success)?.error;
    return {
      code: a.code,
      name: a.name,
      saleCount: data.sales.length,
      lastScraped: data.lastScraped,
      lastErr,
    };
  });

  const topClicks = [...clickStats]
    .sort((a, b) => b.total_clicks - a.total_clicks)
    .slice(0, 10);

  const kvEnabled = isKVEnabled();
  // 航空会社直販 ASP (AFFILIATE_URL_AIRLINE_*) の設定状況 (値は表示しない)
  const airlineAspStatus = getAirlineAffiliateEnvStatus();
  const env = {
    NODE_ENV: process.env.NODE_ENV ?? "?",
    SCRAPER_MODE: process.env.SCRAPER_MODE ?? "?",
    HAS_KV: kvEnabled ? "yes" : "no",
    HAS_RESEND: process.env.RESEND_API_KEY ? "yes" : "no",
    HAS_BLUESKY: process.env.BLUESKY_HANDLE ? "yes" : "no",
    HAS_TRAVELPAYOUTS: process.env.TRAVELPAYOUTS_MARKER ? "yes" : "no",
    HAS_ADMIN_KEY: process.env.ADMIN_API_KEY ? "yes" : "no",
    HAS_2FA: totpEnabled ? "yes" : "no",
    HAS_TURNSTILE: process.env.TURNSTILE_SECRET_KEY ? "yes" : "no",
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <header className="mb-8">
          <h1 className="font-heading text-3xl uppercase tracking-wide text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            運用統計・KV データ・クリック計測のリアルタイム可視化
          </p>
        </header>

        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Metric Icon={Plane} label="アクティブセール" value={fmt(totalActiveSales)} sub={`${Object.keys(allSales).length} 航空会社`} />
          <Metric Icon={MailOpen} label="ニュースレター購読" value={fmt(subscribers.length)} sub="登録 email 数" />
          <Metric Icon={BellRing} label="価格アラート" value={fmt(alerts.length)} sub="登録アラート" />
          <Metric Icon={TrendingUp} label="総クリック" value={fmt(totalClicks)} sub={`${clickStats.length} deals`} />
          <Metric Icon={Database} label="KV ストア" value={kvEnabled ? "有効" : "未設定"} sub={kvEnabled ? "Upstash 接続済" : "FS フォールバック"} accent={kvEnabled ? "emerald" : "rose"} />
        </section>

        {expected && (
          <section className="mb-8">
            <h2 className="font-heading mb-3 text-xl uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
              <MailOpen className="inline h-5 w-5 mr-2" />週次 digest メール
            </h2>
            <p className="mb-2 text-xs text-zinc-500">
              全購読者へ「今週の TOP ディール + 新着記事 + おすすめホテル」をまとめて配信します。
              プレビューで内容を確認してから送信してください。同日重複送信は API 側でガード。
            </p>
            <NewsletterDigestButton token={expected} />
          </section>
        )}

        {expected && (
          <section className="mb-8">
            <h2 className="font-heading mb-3 text-xl uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
              <Database className="inline h-5 w-5 mr-2" />ホテル実物写真 (Google Places)
            </h2>
            <p className="mb-2 text-xs text-zinc-500">
              CURATED_HOTELS のうち <code>imageUrl</code> 未設定の項目について、
              Google Places API (New) から実物写真の photo reference を取得し
              Upstash KV に 30 日 TTL でキャッシュします。GOOGLE_PLACES_API_KEY 必須。
            </p>
            <HotelPhotosRefreshButton token={expected} />
          </section>
        )}

        <section className="mb-8">
          <h2 className="font-heading mb-3 text-xl uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
            航空会社別 scrape 状況
          </h2>
          <div className="sm:hidden divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800">
            {airlineRows.map((r) => (
              <div key={r.code} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{r.name}</div>
                    <div className="text-[11px] font-mono text-zinc-400">{r.code}</div>
                  </div>
                  <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 flex-shrink-0">
                    {r.saleCount}
                  </span>
                </div>
                <div className={`mt-1 font-mono text-[11px] ${statusColor(r.lastScraped)}`}>
                  最終 scrape: {fmtDate(r.lastScraped)}
                </div>
                {r.lastErr && (
                  <div className="mt-1 text-[11px] text-rose-500 break-words">
                    {r.lastErr.slice(0, 80)}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-zinc-500">航空会社</th>
                  <th className="px-4 py-2 text-right text-[11px] font-bold uppercase tracking-wider text-zinc-500">Active</th>
                  <th className="px-4 py-2 text-right text-[11px] font-bold uppercase tracking-wider text-zinc-500">最終 scrape</th>
                  <th className="px-4 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-zinc-500">直近エラー</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {airlineRows.map((r) => (
                  <tr key={r.code} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    <td className="px-4 py-2.5">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">{r.name}</div>
                      <div className="text-[11px] font-mono text-zinc-400">{r.code}</div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono">{r.saleCount}</td>
                    <td className={`px-4 py-2.5 text-right font-mono text-xs ${statusColor(r.lastScraped)}`}>
                      {fmtDate(r.lastScraped)}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-rose-500">
                      {r.lastErr ? r.lastErr.slice(0, 80) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-heading mb-3 text-xl uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
            クリック上位 deals (Top 10)
          </h2>
          {topClicks.length > 0 ? (
            <>
              <div className="sm:hidden divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800">
                {topClicks.map((c) => (
                  <div key={c.deal_id} className="flex items-center justify-between gap-2 p-3">
                    <span className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300 break-all">{c.deal_id}</span>
                    <span className="font-mono text-sm font-bold flex-shrink-0">{c.total_clicks}</span>
                  </div>
                ))}
              </div>
              <div className="hidden sm:block overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-900">
                    <tr>
                      <th className="px-4 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-zinc-500">Deal ID</th>
                      <th className="px-4 py-2 text-right text-[11px] font-bold uppercase tracking-wider text-zinc-500">クリック数</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {topClicks.map((c) => (
                      <tr key={c.deal_id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                        <td className="px-4 py-2.5 font-mono text-xs">{c.deal_id}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold">{c.total_clicks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-500">クリックデータがまだありません</p>
          )}
        </section>

        <section className="mb-8">
          <h2 className="font-heading mb-3 text-xl uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
            <TrendingUp className="inline h-5 w-5 mr-2" />配置位置 (placement) 別 CTR 内訳
          </h2>
          <p className="mb-3 text-xs text-zinc-500">
            直近イベント (各 deal 最大 500 件) を導線別に集計。どの CTA 配置が
            クリックを生んでいるかを把握し、コピー・配置の PDCA に活用します。
            placement 未付与の旧イベントは「(未計測)」に丸めています。
          </p>
          {placementBreakdown.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-900">
                  <tr>
                    <th className="px-4 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-zinc-500">配置位置</th>
                    <th className="px-4 py-2 text-right text-[11px] font-bold uppercase tracking-wider text-zinc-500">クリック</th>
                    <th className="px-4 py-2 text-right text-[11px] font-bold uppercase tracking-wider text-zinc-500">構成比</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {placementBreakdown.map((p) => {
                    const pct =
                      placementTotal > 0
                        ? Math.round((p.clicks / placementTotal) * 1000) / 10
                        : 0;
                    return (
                      <tr key={p.placement} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                        <td className="px-4 py-2.5 font-mono text-xs text-zinc-700 dark:text-zinc-300">{p.placement}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold">{p.clicks}</td>
                        <td className="px-4 py-2.5 text-right font-mono text-xs text-zinc-500">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">placement 計測データがまだありません</p>
          )}
        </section>

        <section className="mb-8">
          <h2 className="font-heading mb-3 text-xl uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
            <Server className="inline h-5 w-5 mr-2" />システム状況
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-4">
            {Object.entries(env).map(([k, v]) => (
              <div key={k} className="rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{k}</p>
                <p className={`text-sm font-mono font-bold ${
                  v === "yes" || v === "有効"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : v === "no" || v === "未設定"
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-zinc-700 dark:text-zinc-200"
                }`}>
                  {v}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-heading mb-3 text-xl uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
            <Plane className="inline h-5 w-5 mr-2" />航空会社 ASP 設定状況
          </h2>
          <p className="mb-3 text-xs text-zinc-500">
            AFFILIATE_URL_AIRLINE_* が設定済みの航空会社は予約 CTA が ASP 経由
            (収益化) になります。未設定は従来挙動 (公式 deep link or Skyscanner)。
            取得ガイドは .env.example を参照。
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-4">
            {airlineAspStatus.map((a) => (
              <div key={a.envKey} className="rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  {a.name}
                </p>
                <p
                  className={`text-sm font-mono font-bold ${
                    a.set
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {a.set ? "設定済 (収益化)" : "未設定"}
                </p>
                <p className="mt-0.5 break-all font-mono text-[9px] text-zinc-400">
                  {a.envKey}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-heading mb-3 text-xl uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
            <Activity className="inline h-5 w-5 mr-2" />最近の操作ログ (最新 20 件)
          </h2>
          {auditLogs.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-900">
                  <tr>
                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-500">時刻</th>
                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-500">アクション</th>
                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-500">対象</th>
                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-500">IP (mask)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {auditLogs.map((log, i) => (
                    <tr key={`${log.timestamp}-${i}`} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                      <td className="px-3 py-2 font-mono text-[11px] text-zinc-500">{fmtDate(log.timestamp)}</td>
                      <td className="px-3 py-2 font-mono">{log.action}</td>
                      <td className="px-3 py-2 font-mono text-zinc-600 dark:text-zinc-400 break-all">{log.target}</td>
                      <td className="px-3 py-2 font-mono text-[11px] text-zinc-500">{log.ip_masked}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              監査ログがまだありません {!kvEnabled && "(KV 未設定 — Upstash 連携後に蓄積されます)"}
            </p>
          )}
        </section>

        <section className="mb-8">
          <h2 className="font-heading mb-3 text-xl uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
            <Users className="inline h-5 w-5 mr-2" />価格アラート 直近 10 件
          </h2>
          {alerts.length > 0 ? (
            <>
              <div className="sm:hidden divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800">
                {alerts.slice(0, 10).map((a) => (
                  <div key={a.id} className="p-3 space-y-1">
                    <div className="text-xs text-zinc-700 dark:text-zinc-300 break-all">
                      {a.email.replace(/(.{2}).*(@.*)/, "$1***$2")}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] text-zinc-500">
                        {a.routeKey ?? a.dealId ?? "—"}
                      </span>
                      <span className="font-mono text-xs font-bold flex-shrink-0">
                        {a.threshold ? `¥${fmt(a.threshold)}` : "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden sm:block overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-900">
                    <tr>
                      <th className="px-4 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-zinc-500">Email (mask)</th>
                      <th className="px-4 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-zinc-500">Route</th>
                      <th className="px-4 py-2 text-right text-[11px] font-bold uppercase tracking-wider text-zinc-500">しきい値</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {alerts.slice(0, 10).map((a) => (
                      <tr key={a.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                        <td className="px-4 py-2.5 text-xs">
                          {a.email.replace(/(.{2}).*(@.*)/, "$1***$2")}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs">
                          {a.routeKey ?? a.dealId ?? "—"}
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono">
                          {a.threshold ? `¥${fmt(a.threshold)}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-500">アラート登録がまだありません</p>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Metric({
  Icon, label, value, sub, accent = "zinc",
}: {
  Icon: typeof Plane;
  label: string;
  value: string;
  sub?: string;
  accent?: "zinc" | "emerald" | "rose" | "amber";
}) {
  const cls = {
    zinc: "text-zinc-900 dark:text-zinc-100",
    emerald: "text-emerald-600 dark:text-emerald-400",
    rose: "text-rose-600 dark:text-rose-400",
    amber: "text-amber-600 dark:text-amber-400",
  }[accent];
  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-zinc-400" />
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{label}</p>
      </div>
      <p className={`font-heading text-2xl tracking-wide ${cls}`}>{value}</p>
      {sub && <p className="text-[11px] text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}
