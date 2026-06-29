import { useEffect, useMemo, useState } from "react";

import CollectionBanner from "../components/products/CollectionBanner";
import EmptyProductState from "../components/products/EmptyProductState";
import ExploreHero from "../components/products/ExploreHero";
import ExploreToolbar from "../components/products/ExploreToolbar";
import ProductFilters from "../components/products/ProductFilters";
import ProductGrid from "../components/products/ProductGrid";
import { getListings } from "../services/listings";

const defaultFilters = {
  category: "All",
  size: "All",
  condition: "All",
};

export default function Explore() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    async function loadListings() {
      setLoading(true);
      const response = await getListings();
      if (response.success) setItems(response.data);
      setLoading(false);
    }

    loadListings();
  }, []);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();

    const result = items.filter((item) => {
      const searchable = [item.title, item.brand, item.category, item.location, item.description, item.size]
        .join(" ")
        .toLowerCase();

      const matchesQuery = !q || searchable.includes(q);
      const matchesCategory = filters.category === "All" || item.category === filters.category;
      const matchesSize = filters.size === "All" || item.size === filters.size;
      const matchesCondition = filters.condition === "All" || item.condition === filters.condition;

      return matchesQuery && matchesCategory && matchesSize && matchesCondition;
    });

    return [...result].sort((a, b) => {
      if (sort === "points-low") return Number(a.points || 0) - Number(b.points || 0);
      if (sort === "points-high") return Number(b.points || 0) - Number(a.points || 0);
      if (sort === "brand") return String(a.brand || "").localeCompare(String(b.brand || ""));
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
  }, [items, query, sort, filters]);

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <section className="section-space pt-10">
      <div className="container-main">
        <ExploreHero />

        <div className="mt-8">
          <CollectionBanner />
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[330px_1fr]">
          <ProductFilters
            filters={filters}
            onChange={updateFilter}
            onReset={() => {
              setFilters(defaultFilters);
              setQuery("");
              setSort("newest");
            }}
          />

          <div>
            <ExploreToolbar
              query={query}
              setQuery={setQuery}
              sort={sort}
              setSort={setSort}
              resultCount={filteredItems.length}
            />

            <div className="mt-8">
              {loading ? (
                <ProductGrid loading />
              ) : filteredItems.length === 0 ? (
                <EmptyProductState />
              ) : (
                <ProductGrid items={filteredItems} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
