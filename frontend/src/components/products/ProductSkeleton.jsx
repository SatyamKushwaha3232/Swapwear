export default function ProductSkeleton() {
  return (
    <article className="overflow-hidden rounded-[26px] border border-slate-100 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.07)]">
      <div className="m-3 h-[252px] animate-pulse rounded-[22px] bg-pink-50 sm:h-[270px] xl:h-[285px]" />

      <div className="space-y-4 px-5 pb-5">
        <div className="h-4 w-24 animate-pulse rounded-full bg-slate-100" />
        <div className="h-6 w-3/4 animate-pulse rounded-full bg-slate-100" />

        <div className="flex gap-2">
          <div className="h-8 w-20 animate-pulse rounded-full bg-slate-100" />
          <div className="h-8 w-24 animate-pulse rounded-full bg-slate-100" />
          <div className="h-8 w-20 animate-pulse rounded-full bg-slate-100" />
        </div>

        <div className="h-px bg-slate-100" />

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-slate-100" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-20 animate-pulse rounded-full bg-slate-100" />
            <div className="h-4 w-32 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="h-11 animate-pulse rounded-full bg-slate-100" />
          <div className="h-11 animate-pulse rounded-full bg-pink-100" />
        </div>
      </div>
    </article>
  );
}