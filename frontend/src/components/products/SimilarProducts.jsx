import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";
import { getListings } from "../../services/listings";
import { items as demoItems } from "../../data/items";

export default function SimilarProducts({ currentId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSimilar() {
      setLoading(true);

      const response = await getListings();

      if (response.success && response.data?.length) {
        setProducts(response.data);
      } else {
        setProducts(demoItems);
      }

      setLoading(false);
    }

    loadSimilar();
  }, []);

  const similar = useMemo(() => {
    return products
      .filter((item) => String(item.id) !== String(currentId))
      .slice(0, 3);
  }, [products, currentId]);

  return (
    <section className="section-space pt-0">
      <div className="container-main">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-5 py-2 font-black text-pink-500">
              <Sparkles size={16} />
              Similar Picks
            </div>

            <h2 className="mt-4 text-4xl font-black tracking-[-2px] md:text-5xl">
              You may also like
            </h2>

            <p className="mt-3 max-w-2xl font-semibold text-[var(--muted)]">
              More sustainable fashion listings selected from the marketplace.
            </p>
          </div>

          <Link
            to="/explore"
            className="inline-flex h-12 w-fit items-center justify-center gap-2 rounded-full border border-pink-100 bg-white px-6 font-black text-pink-500 shadow-md transition hover:bg-pink-50"
          >
            View all
            <ArrowRight size={18} />
          </Link>
        </div>

        {loading ? (
          <div className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 min-[1180px]:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : similar.length === 0 ? (
          <div className="rounded-[30px] border border-pink-100 bg-white p-8 text-center shadow-lg">
            <h3 className="text-2xl font-black">No similar products yet</h3>
            <p className="mt-2 font-semibold text-[var(--muted)]">
              Add more listings to see recommendations.
            </p>
          </div>
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 min-[1180px]:grid-cols-3">
            {similar.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}