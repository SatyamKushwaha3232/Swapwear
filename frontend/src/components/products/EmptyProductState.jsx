import { Link } from "react-router-dom";
import { PackageSearch, RotateCcw, Plus } from "lucide-react";

export default function EmptyProductState({ onReset }) {
  return (
    <div className="rounded-[34px] border border-pink-100 bg-white/85 p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.07)] backdrop-blur-2xl md:p-12">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[30px] bg-pink-50 text-pink-500">
        <PackageSearch size={44} />
      </div>

      <h2 className="mt-7 text-3xl font-black tracking-[-1px] md:text-4xl">
        No products found
      </h2>

      <p className="mx-auto mt-3 max-w-xl font-semibold leading-relaxed text-[var(--muted)]">
        Try changing search keywords or reset filters to discover more
        sustainable fashion listings.
      </p>

      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 font-black text-white transition hover:bg-pink-500"
        >
          <RotateCcw size={18} />
          Reset Filters
        </button>

        <Link
          to="/add-listing"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-pink-100 bg-white px-6 font-black text-pink-500 transition hover:bg-pink-50"
        >
          <Plus size={18} />
          Add Listing
        </Link>
      </div>
    </div>
  );
}