import { Search, Sparkles } from "lucide-react";
import { useState } from "react";
const suggestions = ["Jackets", "Hoodies", "Sneakers", "Vintage", "Streetwear"];
export default function SearchBar() {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  return (
    <div className="relative hidden lg:block">
      <div className="h-14 w-[410px] rounded-full bg-white/90 border border-pink-100 shadow-[0_14px_34px_rgba(15,23,42,0.08)] flex items-center px-5">
        <Search size={20} className="text-pink-500 shrink-0" />
        <input value={value} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 160)} onChange={(e) => setValue(e.target.value)} placeholder="Search products, brands..." className="w-full bg-transparent outline-none px-4 font-bold text-slate-700 placeholder:text-slate-400" />
        <Sparkles size={17} className="text-pink-400" />
      </div>
      {open && (
        <div className="absolute top-[66px] left-0 w-full rounded-[28px] bg-white/95 backdrop-blur-2xl border border-pink-100 shadow-[0_28px_80px_rgba(255,79,163,0.18)] p-4 z-50">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Trending searches</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((item) => <button key={item} type="button" onMouseDown={() => { setValue(item); setOpen(false); }} className="px-4 py-2 rounded-full bg-pink-50 text-pink-500 font-black hover:bg-pink-100 transition">{item}</button>)}
          </div>
        </div>
      )}
    </div>
  );
}
