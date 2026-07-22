import { Header } from "@/components/header";

export default function DealDetailSkeleton() {
  return (
    <>
      <Header />

      {/* Hero image skeleton */}
      <div className="relative h-[30vh] min-h-[240px] animate-pulse overflow-hidden bg-zinc-200 sm:h-[40vh] sm:min-h-[320px]">
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
            {/* Back link placeholder */}
            <div className="mb-4 h-4 w-24 rounded bg-zinc-300/50" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                {/* Badge + route */}
                <div className="mb-2 flex items-center gap-3">
                  <div className="h-5 w-14 rounded-full bg-zinc-300/50" />
                  <div className="h-4 w-24 rounded bg-zinc-300/50" />
                </div>
                {/* Destination */}
                <div className="h-8 w-48 rounded bg-zinc-300/50 sm:h-12 sm:w-64" />
                {/* Airline + sale name */}
                <div className="mt-2 h-3 w-32 rounded bg-zinc-300/50 sm:h-4 sm:w-40" />
              </div>

              <div className="flex flex-col items-end gap-1">
                {/* Original price */}
                <div className="h-3 w-20 rounded bg-zinc-300/50 sm:h-4 sm:w-24" />
                {/* Sale price */}
                <div className="h-8 w-32 rounded bg-zinc-300/50 sm:h-12 sm:w-44" />
                {/* Discount */}
                <div className="mt-1 h-4 w-16 rounded bg-zinc-300/50 sm:h-5 sm:w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left column */}
          <div className="order-2 space-y-6 lg:col-span-2 lg:order-1">
            {/* Price breakdown card */}
            <div className="animate-pulse rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-6">
              <div className="mb-4 h-6 w-40 rounded bg-zinc-200" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-zinc-50 py-2 last:border-0"
                  >
                    <div className="h-4 w-32 rounded bg-zinc-100" />
                    <div className="h-4 w-20 rounded bg-zinc-100" />
                  </div>
                ))}
              </div>
            </div>

            {/* Chart card */}
            <div className="animate-pulse rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="h-6 w-44 rounded bg-zinc-200" />
                <div className="h-4 w-20 rounded bg-zinc-200" />
              </div>
              <div className="mb-6 h-12 rounded-lg bg-zinc-100" />
              <div className="h-48 rounded bg-zinc-100" />
            </div>
          </div>

          {/* Right column */}
          <div className="order-1 space-y-6 lg:order-2">
            {/* Booking button card */}
            <div className="animate-pulse rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <div className="h-12 w-full rounded-lg bg-zinc-200" />
              <div className="mt-3 h-3 w-40 mx-auto rounded bg-zinc-100" />
            </div>

            {/* Share card */}
            <div className="animate-pulse rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <div className="flex items-center justify-between">
                <div className="h-3 w-36 rounded bg-zinc-100" />
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded-full bg-zinc-200" />
                  <div className="h-8 w-8 rounded-full bg-zinc-200" />
                  <div className="h-8 w-8 rounded-full bg-zinc-200" />
                </div>
              </div>
            </div>

            {/* Details card */}
            <div className="animate-pulse rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <div className="mb-4 h-6 w-24 rounded bg-zinc-200" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-3 w-16 rounded bg-zinc-100" />
                    <div className="h-4 w-24 rounded bg-zinc-100" />
                  </div>
                ))}
              </div>
            </div>

            {/* Airline card */}
            <div className="animate-pulse rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <div className="h-3 w-16 rounded bg-zinc-100" />
              <div className="mt-1 h-5 w-28 rounded bg-zinc-200" />
              <div className="mt-3 h-10 w-full rounded-lg bg-zinc-100" />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
