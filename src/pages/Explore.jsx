import { useEffect, useState } from "react";

import ProductFilters from "../components/products/ProductFilters";
import ProductGrid from "../components/products/ProductGrid";
import SectionTitle from "../components/common/SectionTitle";

import { getListings } from "../services/listings";

export default function Explore() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);

      const response = await getListings();

      if (response.success) {
        setProducts(response.data);
      }

      setLoading(false);
    }

    loadProducts();
  }, []);

  return (
    <section className="section-space pt-28">
      <div className="container-main">

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">

          <SectionTitle
            badge="Explore Marketplace"
            title={
              <>
                Discover clothing
                <br />
                swap listings.
              </>
            }
            description="Browse premium pre-loved fashion items with hover previews, videos, and real community uploads."
          />

          <div className="bg-white/55 backdrop-blur-2xl rounded-[34px] border border-white/50 shadow-[0_20px_60px_rgba(15,23,42,0.08)] p-6 min-w-[270px]">

            <p className="text-sm font-black text-[var(--muted)]">
              Available Items
            </p>

            <h3 className="mt-2 text-5xl font-black">
              {products.length}+
            </h3>

            <p className="mt-2 text-[var(--muted)] font-semibold">
              ready to swap
            </p>

          </div>

        </div>

        <ProductFilters />

        <div className="mt-16">

          {loading ? (

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-8">

              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-[480px] rounded-[34px] bg-white/40 animate-pulse border border-white/40"
                />
              ))}

            </div>

          ) : (

            <ProductGrid items={products} />

          )}

        </div>

      </div>
    </section>
  );
}