import DealCardSkeleton from "./deal-card-skeleton";

export default function DealGridSkeleton() {
  return (
    <div>
      {/* Filter bar skeleton */}
      <div className="mb-6 flex animate-pulse flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {/* Search input placeholder */}
        <div className="h-10 w-full rounded-md bg-zinc-100 sm:max-w-xs" />

        {/* Toggle placeholders */}
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="h-5 w-9 rounded-full bg-zinc-200" />
            <div className="h-3 w-14 rounded bg-zinc-200 sm:h-4 sm:w-16" />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="h-5 w-9 rounded-full bg-zinc-200" />
            <div className="h-3 w-16 rounded bg-zinc-200 sm:h-4 sm:w-20" />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="h-5 w-9 rounded-full bg-zinc-200" />
            <div className="h-3 w-10 rounded bg-zinc-200 sm:h-4 sm:w-12" />
          </div>
        </div>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <DealCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
