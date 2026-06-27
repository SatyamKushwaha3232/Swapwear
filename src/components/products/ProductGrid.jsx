import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";

export default function ProductGrid({ items = [], loading = false }) {
  if (loading) {
    return (
      <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <ProductCard key={item.id} item={item} />
      ))}
    </div>
  );
}
