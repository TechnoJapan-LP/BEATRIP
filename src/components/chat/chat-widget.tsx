"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { useLocalizedHref } from "@/components/i18n/locale-provider";

/**
 * BEATRIP AI コンシェルジュ — 全ページ右下のフローティング chat widget。
 *
 * - 環境変数 `NEXT_PUBLIC_ENABLE_CHAT === "1"` でのみ描画 (server 側 API key と
 *   セットで有効化する想定)
 * - 履歴は localStorage に最大 10 件保存
 * - 内部リンク `[link:/path](label)` を Next <Link> に変換
 * - z-index: 起動ボタン z-30 (RecentlyViewedDrawer と同階層)、drawer z-50
 *   PC では右下 24px だが下から 80px 上にずらして Recently viewed と被らない位置
 *   mobile では bottom-nav (~56px) + Recently viewed button (~52px) の上に重ねる
 */

const STORAGE_KEY = "beatrip:chat-history";
const MAX_HISTORY = 10;
const MAX_MESSAGE_LEN = 1000;

type Role = "user" | "assistant";
type Message = { role: Role; content: string };

function loadHistory(): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (m): m is Message =>
          m &&
          typeof m === "object" &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string"
      )
      .slice(-MAX_HISTORY);
  } catch {
    return [];
  }
}

function saveHistory(items: Message[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items.slice(-MAX_HISTORY))
    );
  } catch {
    // quota / private mode は黙殺
  }
}

/**
 * 本文中の `[link:/path](label)` を抽出し、テキスト断片 + Next <Link> の
 * mixed children に変換する。外部 URL は埋め込まない (システムプロンプトで指示)。
 *
 * - path は `/` で始まり、許可された文字 (英数 / `-` `_` `/` `.`) のみ
 * - label はサニタイズ (HTML タグを含まない平文)
 */
function renderWithLinks(
  text: string,
  localize: (href: string) => string
): ReactNode[] {
  const out: ReactNode[] = [];
  // [link:/path](label) — path: /xxx, label: 任意 (改行と ) を除く)
  const re = /\[link:(\/[a-zA-Z0-9_\-/.]+)\]\(([^\n)]{1,80})\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push(text.slice(last, m.index));
    }
    const href = m[1];
    const label = m[2];
    out.push(
      <Link
        key={`l${key++}`}
        href={localize(href)}
        className="text-orange-600 underline underline-offset-2 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
      >
        {label}
      </Link>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function ChatWidget() {
  // env で無効化されていれば描画しない (server 側 API キーとセット運用)
  const enabled = process.env.NEXT_PUBLIC_ENABLE_CHAT === "1";

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const lh = useLocalizedHref();

  // mount 時に履歴復元
  useEffect(() => {
    setMessages(loadHistory());
  }, []);

  // Esc で閉じる + body scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // 自動スクロール
  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, loading, open]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (text.length > MAX_MESSAGE_LEN) {
      setError(`メッセージは ${MAX_MESSAGE_LEN} 文字以内にしてください。`);
      return;
    }

    setError(null);
    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          // 直近履歴のみ送る (server 側でも上限あり)
          history: next.slice(-MAX_HISTORY, -1),
        }),
      });
      const data: { reply?: string; fallback?: string; error?: string } =
        await res.json().catch(() => ({}));
      if (!res.ok || !data.reply) {
        const fallback =
          data.fallback ??
          "ただいま混雑しています。少し時間をおいて再度お試しください。";
        const finalMessages: Message[] = [
          ...next,
          { role: "assistant", content: fallback },
        ];
        setMessages(finalMessages);
        saveHistory(finalMessages);
        return;
      }
      const finalMessages: Message[] = [
        ...next,
        { role: "assistant", content: data.reply },
      ];
      setMessages(finalMessages);
      saveHistory(finalMessages);
    } catch {
      const finalMessages: Message[] = [
        ...next,
        {
          role: "assistant",
          content: "通信に失敗しました。ネットワークをご確認ください。",
        },
      ];
      setMessages(finalMessages);
      saveHistory(finalMessages);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* 起動ボタン: PC は右下 24px から 80px 上 / mobile は FAB スタック 3 段目
          (--fab-3)。offset は globals.css の共通トークンで一元管理。 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="AI コンシェルジュを開く"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed right-3 sm:right-6 bottom-[var(--fab-3)] sm:bottom-20 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-orange-600 text-white shadow-lg shadow-orange-600/30 transition-all hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-xl active:scale-95 dark:bg-orange-500 dark:hover:bg-orange-600"
      >
        <MessageCircle className="h-5 w-5" aria-hidden />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="AI コンシェルジュ"
          className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end"
        >
          {/* backdrop */}
          <button
            type="button"
            aria-label="閉じる"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* drawer panel */}
          <div className="relative flex h-[85vh] sm:h-[600px] w-full sm:w-[420px] sm:mr-6 sm:mb-6 flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            {/* header */}
            <header className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-white dark:bg-orange-500">
                  <MessageCircle className="h-4 w-4" aria-hidden />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    BEATRIP AI コンシェルジュ
                  </h2>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    旅行プランをサポート (β)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="チャットを閉じる"
                className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </header>

            {/* messages */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
            >
              {messages.length === 0 && !loading && (
                <div className="space-y-3 py-4 text-center">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    旅行先や予算など、なんでも聞いてください。
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      "東京から香港の安いホテルは?",
                      "GW に沖縄行きたい",
                      "ESTA いつ取れば良い?",
                    ].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setInput(q)}
                        className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                  <p className="pt-2 text-[10px] text-zinc-400 dark:text-zinc-500">
                    回答は AI 生成です。正確な価格・在庫は OTA でご確認ください。
                  </p>
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === "user"
                      ? "ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-orange-600 px-3 py-2 text-sm text-white dark:bg-orange-500"
                      : "mr-auto max-w-[85%] rounded-2xl rounded-bl-md bg-zinc-100 px-3 py-2 text-sm text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
                  }
                >
                  <div className="whitespace-pre-wrap break-words">
                    {m.role === "assistant"
                      ? renderWithLinks(m.content, lh)
                      : m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="mr-auto flex items-center gap-2 rounded-2xl rounded-bl-md bg-zinc-100 px-3 py-2 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  考えています...
                </div>
              )}
            </div>

            {/* error */}
            {error && (
              <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                {error}
              </div>
            )}

            {/* input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
              className="flex items-end gap-2 border-t border-zinc-200 px-3 py-3 dark:border-zinc-800"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder="質問を入力 (Enter で送信)"
                rows={1}
                maxLength={MAX_MESSAGE_LEN}
                disabled={loading}
                className="flex-1 resize-none rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
              <button
                type="submit"
                disabled={loading || input.trim().length === 0}
                aria-label="送信"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-orange-500 dark:hover:bg-orange-600"
              >
                <Send className="h-4 w-4" aria-hidden />
              </button>
            </form>

            {messages.length > 0 && (
              <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-900">
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-[10px] text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400"
                >
                  履歴を消去
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
