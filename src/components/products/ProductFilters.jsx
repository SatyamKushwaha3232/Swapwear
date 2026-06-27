import { Filter, RotateCcw, SlidersHorizontal } from "lucide-react";

const categories = ["All", "Jackets", "Hoodies", "Sneakers", "Ethnic", "Streetwear", "Vintage", "Luxury"];
const sizes = ["All", "S", "M", "L", "XL", "XXL", "32", "34", "42"];
const conditions = ["All", "New", "Like New", "Good", "Fair"];

export default function ProductFilters({ filters, onChange, onReset }) {
  return (
    <aside className="sticky top-36 hidden h-fit rounded-[38px] border border-pink-100 bg-white/85 p-6 shadow-[0_26px_90px_rgba(15,23,42,0.07)] backdrop-blur-2xl xl:block">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[2px] text-pink-500">Filters</p>
          <h3 className="mt-1 text-2xl font-black">Refine picks</h3>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-pink-500">
          <SlidersHorizontal size={22} />
        </div>
      </div>

      <FilterGroup title="Category" options={categories} value={filters.category} onSelect={(v) => onChange("category", v)} />
      <FilterGroup title="Size" options={sizes} value={filters.size} onSelect={(v) => onChange("size", v)} />
      <FilterGroup title="Condition" options={conditions} value={filters.condition} onSelect={(v) => onChange("condition", v)} />

      <button
        type="button"
        onClick={onReset}
        className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-950 font-black !text-white transition hover:-translate-y-0.5 hover:bg-pink-500"
      >
        <RotateCcw size={17} /> Reset Filters
      </button>
    </aside>
  );
}

function FilterGroup({ title, options, value, onSelect }) {
  return (
    <div className="mt-7 border-t border-pink-50 pt-6">
      <h4 className="font-black text-slate-900">{title}</h4>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`rounded-full px-4 py-2 text-xs font-black transition ${
              value === option
                ? "bg-pink-500 !text-white shadow-[0_10px_24px_rgba(255,79,163,0.22)]"
                : "bg-pink-50 text-pink-500 hover:bg-pink-100"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
