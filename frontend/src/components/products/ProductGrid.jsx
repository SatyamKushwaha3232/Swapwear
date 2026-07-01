import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";

export default function ProductGrid({ items = [], loading = false }) {
  if (loading) {
    return (
      <div className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 min-[1380px]:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 min-[1380px]:grid-cols-3">
      {items.map((item) => (
        <ProductCard key={item.id} item={item} />
      ))}
    </div>
  );
}