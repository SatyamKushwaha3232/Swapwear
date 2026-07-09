import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import EmptyState from "../common/EmptyState";
import SectionHeader from "../common/SectionHeader";
import ProductCard from "../products/ProductCard";
import { getListings } from "../../services/listings";

export default function FeaturedProducts() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await getListings();
      if (res.success) setItems(res.data.slice(0, 6));
    }

    load();
  }, []);

  return (
    <section className="container-main py-16 md:py-20">
      <SectionHeader
        eyebrow="Featured Swaps"
        title="Fresh items from the community."
        action={
          <Link
            to="/explore"
            className="hidden items-center gap-2 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-500 px-7 py-4 font-black text-white shadow-[0_18px_42px_rgba(255,79,163,0.28)] transition hover:-translate-y-0.5 md:flex"
          >
            Explore More <ArrowRight size={18} />
          </Link>
        }
      />

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState />
        </div>
      ) : (
        <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
