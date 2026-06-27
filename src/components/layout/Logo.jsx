import { Link } from "react-router-dom";
import { Recycle } from "lucide-react";

export default function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-3 shrink-0">
      <div className="h-14 w-14 rounded-[22px] bg-gradient-to-br from-pink-500 via-rose-400 to-fuchsia-500 text-white flex items-center justify-center shadow-[0_18px_38px_rgba(255,79,163,0.35)] transition group-hover:scale-105">
        <Recycle size={28} strokeWidth={2.5} />
      </div>
      <div className="leading-none">
        <h1 className="text-[30px] font-black tracking-[-1.5px] text-slate-950">SwapWear</h1>
        <p className="mt-1 text-[12px] font-bold text-slate-500">Sustainable Marketplace</p>
      </div>
    </Link>
  );
}
