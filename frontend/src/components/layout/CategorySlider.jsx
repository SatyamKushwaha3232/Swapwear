import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { getListings } from "../../services/listings";

function getListingImage(item) {
  return item?.image || (Array.isArray(item?.images) ? item.images[0] : "") || "/icons.svg";
}

export default function CategorySlider() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      setLoading(true);
      const response = await getListings(null, { includeUnavailable: true });

      if (mounted && response.success) {
        setItems(response.data || []);
      }

      if (mounted) setLoading(false);
    }

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const grouped = new Map();

    items.forEach((item) => {
      const title = item.category || "Fashion";
      const current = grouped.get(title) || {
        title,
        count: 0,
        image: getListingImage(item),
        latest: item.created_at || "",
      };

      current.count += 1;

      if (new Date(item.created_at || 0) > new Date(current.latest || 0)) {
        current.image = getListingImage(item);
        current.latest = item.created_at || "";
      }

      grouped.set(title, current);
    });

    return [...grouped.values()].sort((a, b) => b.count - a.count).slice(0, 10);
  }, [items]);

  if (!loading && categories.length === 0) {
    return (
      <section className="px-3 py-6 md:px-5">
        <div className="mx-auto max-w-[1500px] rounded-[28px] border border-pink-100 bg-white/75 p-6 text-center shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <p className="font-black text-slate-950">Categories will appear after products are uploaded.</p>
        </div>
      </section>
    );
  }

  const repeatedCategories = [...categories, ...categories];

  return (
    <section className="relative overflow-hidden px-3 py-6 md:px-5 md:py-8">
      <div className="relative mx-auto max-w-[1500px] overflow-hidden rounded-[30px] border border-white/70 bg-white/78 py-7 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl md:rounded-[36px]">
        <div className="relative mb-6 px-5 md:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-4 py-2 text-sm font-black text-pink-500">
                <Sparkles size={15} />
                Uploaded Categories
              </div>

              <h2 className="mt-4 max-w-3xl text-3xl font-black leading-tight md:text-5xl">
                Browse what people have actually listed.
              </h2>
            </div>

            <Link
              to="/explore"
              className="inline-flex h-12 w-fit items-center gap-2 rounded-full bg-slate-950 px-6 font-black text-white transition hover:bg-pink-500"
            >
              View All
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />

          <div className="slider-track flex w-max gap-5 px-6">
            {(loading ? Array.from({ length: 8 }) : repeatedCategories).map((cat, index) =>
              loading ? (
                <div
                  key={index}
                  className="h-[230px] w-[210px] shrink-0 animate-pulse rounded-[26px] bg-pink-50"
                />
              ) : (
                <Link
                  to="/explore"
                  key={`${cat.title}-${index}`}
                  className="group w-[210px] shrink-0"
                >
                  <div className="relative h-[230px] overflow-hidden rounded-[26px] bg-slate-950 shadow-[0_18px_55px_rgba(15,23,42,0.12)]">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      onError={(event) => {
                        event.currentTarget.src = "/icons.svg";
                      }}
                      className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="truncate text-xl font-black text-white">{cat.title}</h3>
                      <p className="mt-1 font-semibold text-white/72">
                        {cat.count} item{cat.count === 1 ? "" : "s"}
                      </p>
                    </div>

                    <div className="absolute right-4 top-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-white/85 text-slate-950 opacity-0 backdrop-blur-xl transition group-hover:translate-y-0 group-hover:opacity-100">
                      <ArrowUpRight size={17} />
                    </div>
                  </div>
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
