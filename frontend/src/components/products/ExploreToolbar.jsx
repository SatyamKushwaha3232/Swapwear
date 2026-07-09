import { Search, SlidersHorizontal } from "lucide-react";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "points-low", label: "Points: Low" },
  { value: "points-high", label: "Points: High" },
  { value: "liked", label: "Most Liked" },
  { value: "brand", label: "Brand A-Z" },
];

export default function ExploreToolbar({
  query,
  setQuery,
  sort,
  setSort,
  resultCount,
  totalCount,
  onOpenFilters,
}) {
  return (
    <div className="premium-surface min-w-0 rounded-[28px] p-4">
      <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex h-13 min-w-0 flex-1 items-center rounded-full border border-white/80 bg-white/80 px-4 shadow-inner shadow-pink-100/40 backdrop-blur-xl">
          <Search size={19} className="shrink-0 text-pink-500" />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, brand, location..."
            className="min-w-0 flex-1 bg-transparent px-3 text-sm font-bold outline-none placeholder:text-slate-400 sm:text-base"
          />
        </div>

        <div className="flex min-w-0 items-center justify-between gap-3">
          <button
            type="button"
            onClick={onOpenFilters}
            className="flex h-13 shrink-0 items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 font-black text-pink-500 shadow-sm transition hover:bg-pink-50 min-[1180px]:hidden"
          >
            <SlidersHorizontal size={18} />
            Filters
          </button>

          <div className="hidden shrink-0 items-center gap-2 text-sm font-black text-slate-500 md:flex">
            <SlidersHorizontal size={18} />
            {resultCount}/{totalCount} results
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-13 min-w-[150px] rounded-full border border-white/80 bg-white/85 px-4 text-sm font-black shadow-sm outline-none backdrop-blur-xl sm:min-w-[180px]"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
