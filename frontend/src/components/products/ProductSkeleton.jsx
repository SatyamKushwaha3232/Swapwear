export default function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-[42px] border border-white/80 bg-white/70 p-3 shadow-[0_28px_90px_rgba(15,23,42,0.06)]">
      <div className="h-[410px] animate-pulse rounded-[34px] bg-pink-100/80" />
      <div className="p-4">
        <div className="h-4 w-28 animate-pulse rounded-full bg-slate-100" />
        <div className="mt-4 h-8 w-3/4 animate-pulse rounded-full bg-slate-100" />
        <div className="mt-5 flex gap-2">
          <div className="h-9 w-24 animate-pulse rounded-full bg-slate-100" />
          <div className="h-9 w-24 animate-pulse rounded-full bg-slate-100" />
        </div>
        <div className="mt-8 h-12 w-full animate-pulse rounded-full bg-slate-100" />
      </div>
    </div>
  );
}
