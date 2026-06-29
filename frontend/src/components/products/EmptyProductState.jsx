import { Link } from "react-router-dom";
import { PackageSearch, Plus } from "lucide-react";

export default function EmptyProductState() {
  return (
    <div className="rounded-[42px] border border-pink-100 bg-white/85 p-12 text-center shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-pink-50 text-pink-500">
        <PackageSearch size={36} />
      </div>
      <h3 className="mt-7 text-4xl font-black tracking-[-1px]">No matching items</h3>
      <p className="mx-auto mt-3 max-w-xl text-lg font-semibold text-slate-500">
        Try changing your search, filters, size or category. You can also list your own item first.
      </p>
      <Link
        to="/add-listing"
        className="mt-8 inline-flex h-14 items-center gap-2 rounded-full bg-slate-950 px-8 font-black !text-white transition hover:-translate-y-0.5 hover:bg-pink-500"
      >
        <Plus size={18} /> Add Listing
      </Link>
    </div>
  );
}
