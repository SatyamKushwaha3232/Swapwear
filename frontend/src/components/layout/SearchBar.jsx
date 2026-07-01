import { Search, Sparkles } from "lucide-react";
import { useState } from "react";

const suggestions = ["Jackets", "Hoodies", "Sneakers", "Vintage", "Streetwear"];

export default function SearchBar() {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <div className="relative hidden min-w-0 flex-1 lg:block">
      <div className="flex h-12 min-w-0 items-center rounded-full border border-pink-100 bg-white/90 px-4 shadow-[0_10px_26px_rgba(15,23,42,0.07)]">
        <Search size={18} className="shrink-0 text-pink-500" />

        <input
          value={value}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 160)}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search products..."
          className="min-w-0 flex-1 bg-transparent px-3 text-sm font-bold text-slate-700 outline-none placeholder:text-slate-400"
        />

        <Sparkles size={16} className="shrink-0 text-pink-400" />
      </div>

      {open && (
        <div className="absolute left-0 top-[60px] z-50 w-full rounded-[24px] border border-pink-100 bg-white/95 p-4 shadow-[0_24px_70px_rgba(255,79,163,0.18)] backdrop-blur-2xl">
          <div className="px-2 text-xs font-black uppercase tracking-widest text-slate-400">
            Trending searches
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                onMouseDown={() => {
                  setValue(item);
                  setOpen(false);
                }}
                className="rounded-full bg-pink-50 px-4 py-2 text-xs font-black text-pink-500 transition hover:bg-pink-100"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}