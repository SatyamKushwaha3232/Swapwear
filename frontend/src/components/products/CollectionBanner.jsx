import { Link } from "react-router-dom";
import { ArrowRight, Crown, Flame, Leaf } from "lucide-react";

const collections = [
  {
    icon: Flame,
    title: "Hot Swaps",
    text: "Most wanted pieces this week",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=85",
  },
  {
    icon: Crown,
    title: "Luxury Finds",
    text: "Premium labels and rare items",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=85",
  },
  {
    icon: Leaf,
    title: "Eco Picks",
    text: "Sustainable swaps with high impact",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85",
  },
];

export default function CollectionBanner() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {collections.map(({ icon: Icon, title, text, image }) => (
        <Link
          key={title}
          to="/explore"
          className="group relative min-h-[260px] overflow-hidden rounded-[34px] bg-slate-950 p-6 text-white shadow-[0_26px_80px_rgba(15,23,42,0.16)] transition hover:-translate-y-1"
        >
          <img
            src={image}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover opacity-58 transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/48 to-transparent" />

          <div className="relative flex h-full min-h-[212px] flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/14 bg-white/14 text-pink-200 backdrop-blur-xl">
                <Icon size={25} />
              </div>
              <ArrowRight
                size={20}
                className="text-white/50 transition group-hover:translate-x-1 group-hover:text-white"
              />
            </div>

            <div>
              <h3 className="text-3xl font-black">{title}</h3>
              <p className="mt-2 font-semibold text-white/70">{text}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
