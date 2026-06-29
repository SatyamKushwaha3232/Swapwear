export default function LoadingGrid({ count = 6 }) {
  return (
    <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-[560px] animate-pulse rounded-[38px] bg-white/80 shadow-lg" />
      ))}
    </div>
  );
}
