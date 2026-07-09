import { Link } from "react-router-dom";
import { ArrowRight, Shirt, Sparkles, Watch } from "lucide-react";

import SectionHeader from "../common/SectionHeader";

const categories = [
  "Streetwear",
  "Sneakers",
  "Accessories",
  "Vintage",
  "Ethnic Wear",
  "Luxury",
];

export default function CategoriesSection() {
  return (
    <section className="container-main py-16 md:py-20">
      <SectionHeader
        eyebrow="Popular Categories"
        title="Explore fashion made for swapping."
        action={
          <Link
            to="/explore"
            className="hidden items-center gap-2 rounded-full border border-white/80 bg-white/80 px-7 py-4 font-black shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:bg-pink-50 md:flex"
          >
            View All <ArrowRight size={18} />
          </Link>
        }
      />

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {categories.map((title, index) => {
          const Icon = index % 3 === 0 ? Shirt : index % 3 === 1 ? Sparkles : Watch;

          return (
            <Link
              key={title}
              to="/explore"
              className="premium-card interactive-lift group rounded-[30px] p-7"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-pink-50 text-pink-500 shadow-sm transition group-hover:scale-105">
                <Icon size={30} />
              </div>

              <h3 className="mt-8 text-3xl font-black">{title}</h3>
              <p className="mt-3 text-slate-500 font-semibold leading-relaxed">
                Discover premium {title.toLowerCase()} items available for swaps.
              </p>

              <span className="mt-8 inline-flex items-center gap-2 font-black text-pink-500">
                Browse <ArrowRight size={18} />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
