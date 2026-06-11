import { Header } from "@/components/header";

export default function Loading() {
  return (
    <>
      <Header />

      {/* ヒーロー画像 */}
      <section className="relative h-[280px] animate-pulse overflow-hidden bg-zinc-300 dark:bg-zinc-700 sm:h-[360px]">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
            <div className="h-4 w-44 rounded bg-white/30" />
            <div className="mt-4 h-9 w-56 rounded bg-white/40 sm:h-12 sm:w-72" />
            <div className="mt-2 h-4 w-40 rounded bg-white/20" />
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {/* クイックアクション */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </div>

        {/* ホテルカードグリッド */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900"
            >
              <div className="aspect-[4/3] bg-zinc-200 dark:bg-zinc-800" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-3 w-1/2 rounded bg-zinc-100 dark:bg-zinc-800/60" />
                <div className="mt-3 h-9 w-full rounded-lg bg-zinc-100 dark:bg-zinc-800/60" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
