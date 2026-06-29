import { ArrowUpRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  {
    title: "Denim Jackets",
    items: "1.2K items",
    image:
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?q=80&w=500&auto=format&fit=crop",
  },
  {
    title: "Oversized Hoodies",
    items: "890 items",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=500&auto=format&fit=crop",
  },
  {
    title: "Streetwear Fits",
    items: "2.4K items",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=500&auto=format&fit=crop",
  },
  {
    title: "Sneakers",
    items: "1.8K items",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=500&auto=format&fit=crop",
  },
  {
    title: "Ethnic Wear",
    items: "760 items",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=500&auto=format&fit=crop",
  },
  {
    title: "Summer Dresses",
    items: "930 items",
    image:
      "https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=500&auto=format&fit=crop",
  },
  {
    title: "Casual Shirts",
    items: "1.1K items",
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=500&auto=format&fit=crop",
  },
  {
    title: "Premium Coats",
    items: "640 items",
    image:
      "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?q=80&w=500&auto=format&fit=crop",
  },
];

export default function CategorySlider() {
  const repeatedCategories = [...categories, ...categories];

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute top-10 left-[-140px] w-[420px] h-[420px] rounded-full bg-pink-300 blur-3xl opacity-20"></div>

      <div className="container-main relative mb-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-400/20 backdrop-blur-xl border border-white/50 text-[var(--accent)] font-black">
              <Sparkles size={16} />
              Explore More
            </div>

            <h2 className="mt-5 text-4xl md:text-6xl font-black tracking-[-2px] leading-[1]">
              Popular swap categories.
            </h2>
          </div>

          <div className="max-w-md">
            <p className="text-[var(--muted)] text-lg leading-relaxed">
              Discover trending fashion categories from the SwapWear community
              and jump directly into curated swap collections.
            </p>

            <Link
              to="/explore"
              className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-pink-400/30 backdrop-blur-xl border border-white/50 font-black hover:bg-pink-400/45 transition"
            >
              View All Categories
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[var(--bg)] to-transparent z-10"></div>
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[var(--bg)] to-transparent z-10"></div>

        <div className="slider-track flex gap-7 w-max px-7">
          {repeatedCategories.map((cat, index) => (
            <Link
              to="/explore"
              key={`${cat.title}-${index}`}
              className="w-[240px] shrink-0 group"
            >
              <div className="relative h-[300px] rounded-[38px] overflow-hidden bg-white/55 backdrop-blur-2xl border border-white/50 shadow-[0_22px_70px_rgba(15,23,42,0.08)]">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"></div>

                <div className="absolute left-5 right-5 bottom-5">
                  <h3 className="text-white text-2xl font-black leading-tight">
                    {cat.title}
                  </h3>

                  <p className="mt-1 text-white/75 font-semibold">
                    {cat.items}
                  </p>
                </div>

                <div className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/70 backdrop-blur-xl border border-white/50 flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition">
                  <ArrowUpRight size={18} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
