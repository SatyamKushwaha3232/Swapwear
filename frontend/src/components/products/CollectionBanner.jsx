import { Link } from "react-router-dom";
import { ArrowRight, Crown, Flame, Leaf } from "lucide-react";

const collections = [
  { icon: Flame, title: "Hot Swaps", text: "Most wanted pieces this week" },
  { icon: Crown, title: "Luxury Finds", text: "Premium labels and rare items" },
  { icon: Leaf, title: "Eco Picks", text: "Sustainable swaps with high impact" },
];

export default function CollectionBanner() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {collections.map(({ icon: Icon, title, text }) => (
        <Link
          key={title}
          to="/explore"
          className="group overflow-hidden rounded-[34px] border border-pink-100 bg-white/85 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.06)] backdrop-blur-xl transition hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-pink-500">
              <Icon size={25} />
            </div>
            <ArrowRight size={20} className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-pink-500" />
          </div>
          <h3 className="mt-6 text-2xl font-black">{title}</h3>
          <p className="mt-2 font-semibold text-slate-500">{text}</p>
        </Link>
      ))}
    </div>
  );
}
