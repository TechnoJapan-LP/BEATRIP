"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Check, Loader2, X, TrendingDown, ArrowUpRight } from "lucide-react";
import { trackNewsletterSignup } from "@/components/analytics";
import { formatPrice } from "@/lib/format";

/**
 * ExitIntentModal — 離脱直前に「お得情報を見逃さない」訴求を出す
 * コンバージョン強化モーダル。
 *
 * トリガー:
 *  - PC (ポインタあり): マウスが viewport 上端から離れる (clientY <= 0) を検出。
 *    本物の「タブを閉じる/URL バーへ向かう」動作を捉える exit-intent。
 *  - モバイル (ポインタなし / タッチ): 70% スクロール かつ 最低滞在時間の経過で発火。
 *    スクロールだけ・短時間滞在では出さない (うっとうしさ回避)。
 *
 * 配慮ガード (SERP 流入直後の不快なインタースティシャルを避ける):
 *  - 最低滞在時間: ページ到達から 15 秒未満は PC / モバイル共通で発火しない。
 *    Google が嫌う「着地直後 popup」を構造的に排除する。
 *  - エンゲージメント: PC でもスクロール 25% 未満では発火しない (誤爆防止)。
 *    スクロール余地がほぼ無い短いページのみ免除。
 *  - セッション内 1 回まで (sessionStorage)。閉じても同一タブ内では再発火しない。
 *
 * 抑制:
 *  - localStorage に dismiss 記録。7 日間は再表示しない。
 *  - 登録完了後も同じ dismiss キーを書いて再表示を止める。
 *  - prefers-reduced-motion 時はアニメーションを無効化。
 *
 * 内容:
 *  - メルマガ購読フォーム (NewsletterCTASlim と同じ /api/newsletter を叩く)。
 *  - 人気ディール TOP3 (サーバーから props で受け取る。空なら非表示)。
 */

const STORAGE_KEY = "beatrip:exit-intent:dismissed-at";
const SESSION_KEY = "beatrip:exit-intent:shown";
const DISMISS_DAYS = 7;
const MOBILE_SCROLL_THRESHOLD = 0.7;
/** ページ到達からの最低滞在時間。これ未満では PC / モバイル共に発火しない。 */
const MIN_DWELL_MS = 15000;
/** PC のエンゲージメントガード: スクロール到達率がこれ未満なら発火しない。 */
const MIN_ENGAGEMENT_SCROLL_RATIO = 0.25;
/** スクロール余地がこれ未満 (px) のページはエンゲージメントガードを免除。 */
const MIN_SCROLLABLE_PX = 200;

export type ExitIntentDeal = {
  id: string;
  destination: string;
  price: number;
  discountPercent: number;
  route: string;
};

function isDismissed(): boolean {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function rememberDismiss() {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    /* localStorage 不可 (プライベートブラウズ等) は無視 */
  }
}

/** セッション内に一度表示済みか (タブを閉じるまで再発火しない)。 */
function isShownThisSession(): boolean {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberShownThisSession() {
  try {
    window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* sessionStorage 不可は無視 (armedRef が同一マウント内の重複は防ぐ) */
  }
}

/** スクロール可能な総量 (px)。 */
function scrollableHeight(): number {
  return document.documentElement.scrollHeight - window.innerHeight;
}

/** 現在のスクロール到達率 (0〜1)。スクロール余地が無いページは 0。 */
function currentScrollRatio(): number {
  const total = scrollableHeight();
  if (total <= 0) return 0;
  return window.scrollY / total;
}


export function ExitIntentModal({ deals = [] }: { deals?: ExitIntentDeal[] }) {
  const [open, setOpen] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const armedRef = useRef(false);

  const close = useCallback(() => {
    setOpen(false);
    rememberDismiss();
  }, []);

  // 発火条件のセットアップ
  useEffect(() => {
    if (isDismissed() || isShownThisSession()) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);

    // ポインタの有無で PC / モバイルを判定 (タッチ端末は scroll-depth)
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

    // 最低滞在時間ガード (PC / モバイル共通)。
    // SERP 着地直後のインタースティシャル表示を避ける。
    let dwellReached = false;
    const dwellTimer = window.setTimeout(() => {
      dwellReached = true;
      // モバイルは「70% 到達後にスクロールが止まったまま 15 秒経過」でも
      // 発火できるよう、滞在時間達成のタイミングでも一度判定する。
      if (!hasFinePointer) checkMobileTrigger();
    }, MIN_DWELL_MS);

    // PC のエンゲージメントガード: 一度でも 25% スクロールしたら true。
    // スクロール余地のほぼ無い短いページは免除 (25% が意味を持たないため)。
    let engaged = scrollableHeight() < MIN_SCROLLABLE_PX;

    const trigger = () => {
      if (armedRef.current) return;
      if (isDismissed()) return;
      armedRef.current = true;
      rememberShownThisSession();
      setOpen(true);
    };

    const checkMobileTrigger = () => {
      if (!dwellReached) return;
      if (currentScrollRatio() >= MOBILE_SCROLL_THRESHOLD) trigger();
    };

    let ticking = false;
    const onScrollCheck = () => {
      ticking = false;
      if (!engaged && currentScrollRatio() >= MIN_ENGAGEMENT_SCROLL_RATIO) {
        engaged = true;
      }
      if (!hasFinePointer) checkMobileTrigger();
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(onScrollCheck);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const cleanups: Array<() => void> = [
      () => {
        window.clearTimeout(dwellTimer);
        window.removeEventListener("scroll", onScroll);
      },
    ];

    if (hasFinePointer) {
      // PC: マウスが viewport 上端を越えて離れたら exit-intent とみなす。
      // ただし 15 秒未満の滞在・25% 未満のスクロールでは発火しない。
      const onMouseOut = (e: MouseEvent) => {
        // relatedTarget が null かつ上方向に抜けた場合のみ
        if (e.clientY > 0 || e.relatedTarget) return;
        if (!dwellReached || !engaged) return;
        trigger();
      };
      document.addEventListener("mouseout", onMouseOut);
      cleanups.push(() => document.removeEventListener("mouseout", onMouseOut));
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  // Esc で閉じる
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      if (!res.ok) throw new Error("request failed");
      trackNewsletterSignup({ source: "exit_intent" });
      setStatus("success");
      // 成功後は再表示しないよう dismiss 記録
      rememberDismiss();
    } catch {
      setStatus("error");
    }
  }

  if (!open) return null;

  // 優しい登場: backdrop ごと ease-out フェード (beatrip-fade-in は 0.3s ease-out)。
  // reduced-motion 時は CSS 側の無効化に加えて JS でもクラスを外す (二重ガード)。
  const anim = reduceMotion ? "" : "animate-fade-in";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="お得情報のご案内"
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 ${anim}`}
    >
      {/* backdrop */}
      <button
        type="button"
        aria-label="閉じる"
        onClick={close}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900">
        <button
          type="button"
          onClick={close}
          aria-label="閉じる"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 pb-6 pt-7">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                お得情報を見逃さない
              </h2>
              <p className="text-[11px] text-zinc-500">
                最安値のフライトセールを週次でお届け
              </p>
            </div>
          </div>

          {status === "success" ? (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
              <Check className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs font-medium">
                登録完了。新着セールをメールでお届けします
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2">
              <input
                type="text"
                name="website"
                value={website}
                onChange={(ev) => setWebsite(ev.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "-9999px",
                  width: 1,
                  height: 1,
                  opacity: 0,
                }}
              />
              <input
                type="email"
                required
                placeholder="メールアドレス"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                autoComplete="email"
                inputMode="email"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-base text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 sm:text-sm"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white transition-[transform,background-color] hover:bg-zinc-700 active:scale-[0.98] disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                {status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "無料で登録する"
                )}
              </button>
              {status === "error" && (
                <span className="text-[11px] text-rose-500">
                  失敗しました。時間をおいて再試行してください。
                </span>
              )}
              <p className="text-center text-[10px] text-zinc-400">
                配信停止はいつでも可能・登録無料
              </p>
            </form>
          )}

          {deals.length > 0 && (
            <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <p className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                <TrendingDown className="h-3 w-3 text-rose-500" />
                いま人気のセール TOP{deals.length}
              </p>
              <div className="space-y-1.5">
                {deals.map((d) => (
                  <Link
                    key={d.id}
                    href={`/deals/${d.id}`}
                    onClick={close}
                    className="group flex items-center justify-between gap-2 rounded-lg border border-zinc-100 px-3 py-2 transition-colors hover:border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/60"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {d.destination}
                      </p>
                      <p className="truncate text-[10px] text-zinc-500">
                        {d.route}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1.5">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        ¥{formatPrice(d.price)}
                      </span>
                      {d.discountPercent > 0 && (
                        <span className="text-[10px] font-bold text-rose-500">
                          -{d.discountPercent}%
                        </span>
                      )}
                      <ArrowUpRight className="h-3 w-3 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
