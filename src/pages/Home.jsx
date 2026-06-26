import HeroSection from "../components/hero/HeroSection";
import ProductFilters from "../components/products/ProductFilters";
import ProductGrid from "../components/products/ProductGrid";
import SectionTitle from "../components/common/SectionTitle";

import { items } from "../data/items";

/* =========================================
   Home Page
========================================= */

export default function Home() {
  const featuredItems = items.slice(0, 8);

  return (
    <>

      {/* HERO */}
      <HeroSection />

      {/* FEATURED MARKETPLACE */}
      <section className="section-space">
        <div className="container-main">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">

            <SectionTitle
              badge="Featured Listings"
              title={
                <>
                  Trending clothing
                  <br />
                  ready to swap
                </>
              }
              description="Explore premium pre-loved clothing listings with multi-angle previews, swap points, owner details, and nearby matching."
            />

            <div className="bg-white rounded-[34px] border border-[var(--line)] shadow-[var(--shadow-soft)] p-6 min-w-[260px]">

              <p className="text-sm font-black text-[var(--muted)]">
                Live Listings
              </p>

              <h3 className="mt-2 text-5xl font-black">
                {items.length}+
              </h3>

              <p className="mt-2 text-[var(--muted)] font-semibold">
                community items available
              </p>

            </div>

          </div>

          <ProductFilters />

          <div className="mt-16">
            <ProductGrid items={featuredItems} />
          </div>

        </div>
      </section>

    </>
  );
}