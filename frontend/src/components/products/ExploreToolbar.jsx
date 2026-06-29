import { Search, SlidersHorizontal } from "lucide-react";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "points-low", label: "Points: Low" },
  { value: "points-high", label: "Points: High" },
  { value: "brand", label: "Brand" },
];

export default function ExploreToolbar({ query, setQuery, sort, setSort, resultCount }) {
  return (
    <div className="rounded-[34px] border border-pink-100 bg-white/85 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.07)] backdrop-blur-2xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex h-14 flex-1 items-center rounded-full bg-slate-50 px-5">
          <Search size={20} className="text-pink-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, brand, location..."
            className="w-full bg-transparent px-4 font-bold outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 text-sm font-black text-slate-500 md:flex">
            <SlidersHorizontal size={18} /> {resultCount} results
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-14 rounded-full border border-pink-100 bg-white px-5 font-black outline-none"
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
