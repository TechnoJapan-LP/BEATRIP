import { Header } from "@/components/header";

/**
 * 空港・路線・都市など「ヒーロー + メイン/サイドバー」型ページ共通の
 * スケルトン。レイアウトシフト防止用。
 */
export default function HubPageSkeleton({
  heroClassName = "bg-zinc-200",
}: {
  /** ヒーロー背景の Tailwind クラス (ページのテーマ色に合わせる) */
  heroClassName?: string;
}) {
  return (
    <>
      <Header />

      {/* ヒーロー */}
      <section className={`relative ${heroClassName}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-10">
          <div className="h-4 w-40 rounded bg-white/30 animate-pulse" />
          <div className="mt-6 h-5 w-28 rounded-full bg-white/30 animate-pulse" />
          <div className="mt-3 h-10 w-3/4 max-w-lg rounded bg-white/40 animate-pulse sm:h-14" />
          <div className="mt-3 h-4 w-2/3 max-w-md rounded bg-white/20 animate-pulse" />
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-8">
            {/* セクション見出し + カードグリッド */}
            {Array.from({ length: 2 }).map((_, s) => (
              <section key={s}>
                <div className="mb-3 h-6 w-48 rounded bg-zinc-200 animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-20 rounded-xl border border-zinc-100 bg-white p-4 animate-pulse"
                    >
                      <div className="h-4 w-2/3 rounded bg-zinc-100" />
                      <div className="mt-2 h-3 w-1/2 rounded bg-zinc-100" />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* サイドバー */}
          <aside className="space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-zinc-100 bg-white p-5 animate-pulse"
              >
                <div className="h-5 w-32 rounded bg-zinc-200" />
                <div className="mt-3 space-y-2">
                  <div className="h-10 w-full rounded-lg bg-zinc-100" />
                  <div className="h-10 w-full rounded-lg bg-zinc-100" />
                </div>
              </div>
            ))}
          </aside>
        </div>
      </main>
    </>
  );
}
