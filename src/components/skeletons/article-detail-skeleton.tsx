import { Header } from "@/components/header";

/** 記事詳細ページ用スケルトン (ヒーロー画像 + 本文 + サイドバー)。 */
export default function ArticleDetailSkeleton() {
  return (
    <>
      <Header />

      {/* ヒーロー画像 */}
      <div className="relative h-[28vh] min-h-[220px] animate-pulse overflow-hidden bg-zinc-200 sm:h-[35vh] sm:min-h-[280px]">
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-4xl px-4 pb-8 sm:px-6">
            <div className="mb-4 h-4 w-48 rounded bg-zinc-300/50" />
            <div className="mb-3 h-5 w-20 rounded-full bg-zinc-300/50" />
            <div className="h-7 w-3/4 rounded bg-zinc-300/60 sm:h-9" />
            <div className="mt-3 h-3 w-32 rounded bg-zinc-300/40" />
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* 本文 */}
          <div className="lg:col-span-2">
            <div className="animate-pulse rounded-xl border border-zinc-100 bg-white p-4 sm:p-6 lg:p-8">
              <div className="space-y-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-3.5 rounded bg-zinc-100 ${
                      i % 4 === 0 ? "w-1/2 bg-zinc-200" : "w-full"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* サイドバー */}
          <aside className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-zinc-100 bg-white p-5"
              >
                <div className="h-5 w-28 rounded bg-zinc-200" />
                <div className="mt-3 space-y-2">
                  <div className="h-9 w-full rounded-lg bg-zinc-100" />
                  <div className="h-9 w-full rounded-lg bg-zinc-100" />
                </div>
              </div>
            ))}
          </aside>
        </div>
      </main>
    </>
  );
}
