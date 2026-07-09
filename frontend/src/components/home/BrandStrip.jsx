import useRotatingListings from "../../hooks/useRotatingListings";

export default function BrandStrip() {
  const { allItems, loading } = useRotatingListings(8);

  const brands = [
    ...new Set(
      allItems
        .map((item) => item.brand || item.category)
        .filter(Boolean)
        .map((item) => String(item).trim())
    ),
  ].slice(0, 12);

  if (loading) {
    return (
      <section className="overflow-hidden py-12">
        <div className="flex w-max gap-5 px-5">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-20 min-w-[210px] animate-pulse rounded-[26px] bg-pink-50" />
          ))}
        </div>
      </section>
    );
  }

  if (brands.length === 0) return null;

  return (
    <section className="overflow-hidden py-12">
      <p className="mb-8 text-center text-sm font-black uppercase text-slate-400">
        Uploaded Product Brands
      </p>
      <div className="marquee-track flex w-max gap-5 px-5">
        {[...brands, ...brands].map((brand, index) => (
          <div
            key={`${brand}-${index}`}
            className="flex h-20 min-w-[210px] items-center justify-center rounded-[26px] border border-pink-100 bg-white/86 px-8 text-2xl font-black text-slate-800 shadow-lg backdrop-blur-xl"
          >
            {brand}
          </div>
        ))}
      </div>
    </section>
  );
}
