import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { getListings } from "../../services/listings";

export default function SimilarProducts({ currentId }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await getListings();
      if (res.success) setItems((res.data || []).filter((item) => String(item.id) !== String(currentId)).slice(0, 3));
    }
    load();
  }, [currentId]);

  if (!items.length) return null;

  return (
    <section className="container-main py-16">
      <p className="font-black text-pink-500">More like this</p>
      <h2 className="mt-3 text-5xl font-black tracking-[-2px] text-slate-950">Similar swap picks.</h2>
      <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => <ProductCard key={item.id} item={item} />)}
      </div>
    </section>
  );
}
