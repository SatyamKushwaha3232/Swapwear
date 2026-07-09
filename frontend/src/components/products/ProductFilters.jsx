import { Filter, RotateCcw, SlidersHorizontal, X } from "lucide-react";

const categories = [
  "All",
  "Jackets",
  "Hoodies",
  "Shirts",
  "Tshirts",
  "Jeans",
  "Sneakers",
  "Ethnic",
  "Dresses",
  "Kurti",
  "Saree",
  "Accessories",
  "Streetwear",
  "Vintage",
  "Luxury",
];

const sizes = [
  "All",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "28",
  "30",
  "32",
  "34",
  "36",
  "Free Size",
];

const conditions = ["All", "New", "Like New", "Excellent", "Good", "Used"];

export default function ProductFilters({
  filters,
  onChange,
  onReset,
  mobileOpen,
  setMobileOpen,
}) {
  return (
    <>
      <aside className="premium-surface sticky top-32 hidden h-fit min-w-0 rounded-[30px] p-5 min-[1180px]:block">
        <FilterContent
          filters={filters}
          onChange={onChange}
          onReset={onReset}
        />
      </aside>

      <div
        className={`fixed inset-0 z-[1100] transition min-[1180px]:hidden ${
          mobileOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        <aside
          className={`absolute right-0 top-0 h-full w-[88%] max-w-[390px] overflow-y-auto border-l border-white/70 bg-white/95 p-5 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-black">Filters</h2>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-50 text-pink-500 shadow-sm"
            >
              <X size={22} />
            </button>
          </div>

          <FilterContent
            filters={filters}
            onChange={onChange}
            onReset={() => {
              onReset();
              setMobileOpen(false);
            }}
          />
        </aside>
      </div>
    </>
  );
}

function FilterContent({ filters, onChange, onReset }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-xs font-black uppercase tracking-[1.8px] text-pink-500">
            Filters
          </p>
          <h3 className="mt-1 truncate text-2xl font-black">Refine picks</h3>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-pink-500 shadow-sm">
          <SlidersHorizontal size={21} />
        </div>
      </div>

      <FilterGroup
        title="Category"
        options={categories}
        value={filters.category}
        onSelect={(v) => onChange("category", v)}
      />

      <FilterGroup
        title="Size"
        options={sizes}
        value={filters.size}
        onSelect={(v) => onChange("size", v)}
      />

      <FilterGroup
        title="Condition"
        options={conditions}
        value={filters.condition}
        onSelect={(v) => onChange("condition", v)}
      />

      <div className="mt-6 border-t border-pink-50 pt-5">
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-black text-slate-900">Max Points</h4>
          <span className="rounded-full bg-pink-50 px-3 py-1.5 text-xs font-black text-pink-500">
            {filters.maxPoints}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="5000"
          step="100"
          value={filters.maxPoints}
          onChange={(e) => onChange("maxPoints", Number(e.target.value))}
          className="mt-4 w-full accent-pink-500"
        />
      </div>

      <button
        type="button"
        onClick={onReset}
        className="button-primary mt-7 h-12 min-h-0 w-full"
      >
        <RotateCcw size={17} /> Reset Filters
      </button>
    </div>
  );
}

function FilterGroup({ title, options, value, onSelect }) {
  return (
    <div className="mt-6 border-t border-pink-50 pt-5">
      <h4 className="font-black text-slate-900">{title}</h4>

      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`max-w-full truncate rounded-full px-3.5 py-2 text-xs font-black transition ${
              value === option
                ? "bg-pink-500 !text-white shadow-[0_10px_24px_rgba(255,79,163,0.22)]"
                : "border border-white/80 bg-white/70 text-pink-500 shadow-sm hover:bg-pink-50"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
