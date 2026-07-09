import { ArrowUpRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  {
    title: "Denim Jackets",
    items: "1.2K items",
    image:
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?q=80&w=700&auto=format&fit=crop",
  },
  {
    title: "Oversized Hoodies",
    items: "890 items",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=700&auto=format&fit=crop",
  },
  {
    title: "Streetwear Fits",
    items: "2.4K items",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=700&auto=format&fit=crop",
  },
  {
    title: "Sneakers",
    items: "1.8K items",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=700&auto=format&fit=crop",
  },
  {
    title: "Ethnic Wear",
    items: "760 items",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=700&auto=format&fit=crop",
  },
  {
    title: "Summer Dresses",
    items: "930 items",
    image:
      "https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=700&auto=format&fit=crop",
  },
  {
    title: "Casual Shirts",
    items: "1.1K items",
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=700&auto=format&fit=crop",
  },
  {
    title: "Premium Coats",
    items: "640 items",
    image:
      "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?q=80&w=700&auto=format&fit=crop",
  },
];

export default function CategorySlider() {
  const repeatedCategories = [...categories, ...categories];

  return (
    <section className="relative overflow-hidden px-3 py-8 md:px-5 md:py-10">
      <div className="relative mx-auto max-w-[1500px] overflow-hidden rounded-[38px] bg-slate-950 py-8 text-white shadow-[0_34px_100px_rgba(15,23,42,0.18)] md:rounded-[44px] md:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,79,163,0.24),transparent_30%),radial-gradient(circle_at_85%_90%,rgba(139,92,246,0.18),transparent_34%)]" />

        <div className="relative mb-8 px-5 md:px-8 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-5 py-2 font-black text-pink-200 backdrop-blur-xl">
                <Sparkles size={16} />
                Explore More
              </div>

              <h2 className="mt-5 max-w-4xl text-[clamp(34px,4.8vw,68px)] font-black leading-[0.94]">
                Browse the categories people actually want to swap.
              </h2>
            </div>

            <div className="max-w-md">
              <p className="text-lg font-semibold leading-relaxed text-white/62">
                Discover trending fashion collections from the SwapWear community
                and jump into curated swap categories.
              </p>

              <Link
                to="/explore"
                className="mt-5 inline-flex h-12 items-center gap-2 rounded-full border border-white/14 bg-white/10 px-6 font-black text-white backdrop-blur-xl transition hover:bg-white hover:text-slate-950"
              >
                View All Categories
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-32 bg-gradient-to-r from-slate-950 to-transparent" />
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-32 bg-gradient-to-l from-slate-950 to-transparent" />

          <div className="slider-track flex w-max gap-6 px-7">
            {repeatedCategories.map((cat, index) => (
              <Link
                to="/explore"
                key={`${cat.title}-${index}`}
                className="group w-[250px] shrink-0"
              >
                <div className="relative h-[320px] overflow-hidden rounded-[30px] border border-white/12 bg-white/10 shadow-[0_22px_70px_rgba(0,0,0,0.20)]">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="h-full w-full object-cover opacity-86 transition duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/26 to-transparent" />

                  <div className="absolute bottom-5 left-5 right-5">
                    <h3 className="text-2xl font-black leading-tight text-white">
                      {cat.title}
                    </h3>

                    <p className="mt-1 font-semibold text-white/72">{cat.items}</p>
                  </div>

                  <div className="absolute right-5 top-5 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full border border-white/20 bg-white/18 text-white opacity-0 backdrop-blur-xl transition group-hover:translate-y-0 group-hover:opacity-100">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
