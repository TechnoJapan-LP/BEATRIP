export default function DealCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-100">
      {/* Image area with overlay content */}
      <div className="relative aspect-[4/3] animate-pulse bg-zinc-200">
        {/* Badge placeholder */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
          <div className="h-4 w-12 rounded-full bg-zinc-300 sm:h-5 sm:w-14" />
        </div>

        {/* Discount badge placeholder */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          <div className="h-5 w-14 rounded-full bg-zinc-300 sm:h-6 sm:w-16" />
        </div>

        {/* Bottom overlay: route + price */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end justify-between">
            <div>
              {/* Route code */}
              <div className="mb-1.5 h-3 w-20 rounded bg-zinc-300/60 sm:h-3.5 sm:w-24" />
              {/* Destination name */}
              <div className="h-5 w-28 rounded bg-zinc-300/60 sm:h-7 sm:w-36" />
            </div>
            <div className="flex flex-col items-end gap-1">
              {/* Original price */}
              <div className="h-2.5 w-14 rounded bg-zinc-300/60 sm:h-3 sm:w-16" />
              {/* Sale price */}
              <div className="h-5 w-20 rounded bg-zinc-300/60 sm:h-7 sm:w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar: airline info */}
      <div className="flex animate-pulse items-center justify-between px-2.5 py-2 sm:px-4 sm:py-2.5">
        <div className="flex items-center gap-2">
          <div className="h-3 w-16 rounded bg-zinc-200 sm:w-20" />
          <div className="hidden h-3 w-12 rounded bg-zinc-200 sm:block" />
        </div>
        <div className="h-3 w-20 rounded bg-zinc-200 sm:w-24" />
      </div>
    </div>
  );
}
