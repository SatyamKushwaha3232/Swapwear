import { Search, SlidersHorizontal } from "lucide-react";

const categories = [
  "All",
  "Streetwear",
  "Vintage",
  "Luxury",
  "Sneakers",
  "Ethnic",
  "Oversized",
  "Y2K",
];

export default function ProductFilters() {
  return (
    <div className="mt-14 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
      <div className="flex flex-wrap gap-3">
        {categories.map((category, index) => (
          <button
            key={category}
            className={`
              px-6 py-3 rounded-full
              backdrop-blur-2xl
              border
              transition-all duration-300
              font-black text-sm
              ${
                index === 0
                  ? `
                    bg-pink-400/30
                    border-pink-300/40
                    shadow-[0_10px_25px_rgba(255,105,180,0.18)]
                  `
                  : `
                    bg-white/45
                    border-white/50
                    hover:bg-pink-400/20
                  `
              }
            `}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="h-[58px] w-full sm:w-[320px] rounded-full bg-white/50 backdrop-blur-2xl border border-white/50 shadow-[0_10px_35px_rgba(15,23,42,0.06)] flex items-center px-5">
          <Search size={18} className="text-[var(--muted)]" />

          <input
            type="text"
            placeholder="Search fashion..."
            className="w-full bg-transparent outline-none px-3 text-[15px]"
          />
        </div>

        <button
          className="
            h-[58px]
            px-7
            rounded-full
            bg-white/50
            backdrop-blur-2xl
            border border-white/50
            flex items-center gap-3
            font-black
            shadow-[0_10px_35px_rgba(15,23,42,0.06)]
            hover:bg-pink-400/20
            transition-all
          "
        >
          <SlidersHorizontal size={18} />
          Filters
        </button>
      </div>
    </div>
  );
}