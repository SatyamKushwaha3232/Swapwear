import { Link } from "react-router-dom";
import { PackagePlus } from "lucide-react";
export default function EmptyState({ title = "No items yet", text = "Add your first listing and it will appear here." }) {
  return <div className="rounded-[42px] bg-white border border-pink-100 p-12 text-center shadow-[0_24px_80px_rgba(15,23,42,0.06)]"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-pink-50 text-pink-500"><PackagePlus size={30} /></div><h3 className="mt-6 text-3xl font-black">{title}</h3><p className="mt-3 font-semibold text-slate-500">{text}</p><Link to="/add-listing" className="mt-7 inline-flex h-12 items-center rounded-full bg-slate-950 px-7 font-black text-white">Add Listing</Link></div>;
}
