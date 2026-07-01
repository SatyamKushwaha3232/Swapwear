import { Link } from "react-router-dom";
import { Recycle } from "lucide-react";

export default function Logo() {
  return (
    <Link to="/" className="group flex min-w-0 shrink-0 items-center gap-2.5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-pink-500 via-rose-400 to-fuchsia-500 text-white shadow-[0_14px_30px_rgba(255,79,163,0.32)] transition group-hover:scale-105 md:h-12 md:w-12">
        <Recycle size={24} strokeWidth={2.5} />
      </div>

      <div className="hidden min-w-0 leading-none sm:block">
        <h1 className="truncate text-[22px] font-black tracking-[-1px] text-slate-950 md:text-[24px]">
          SwapWear
        </h1>
        <p className="mt-1 truncate text-[11px] font-bold text-slate-500">
          Sustainable Marketplace
        </p>
      </div>
    </Link>
  );
}