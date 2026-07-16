import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import useRotatingListings from "../../hooks/useRotatingListings";
import { categoryHighlights } from "../../utils/marketplaceHighlights";

export default function HomeCTA() {
  const { allItems } = useRotatingListings(4);
  const topCategory = categoryHighlights(allItems, 1)[0]?.title;

  return (
    <section className="container-main py-12 md:py-16">
      <div className="relative overflow-hidden rounded-[34px] bg-white p-8 text-center shadow-[0_28px_90px_rgba(15,23,42,0.08)] md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,79,163,0.12),transparent_32%),radial-gradient(circle_at_80%_90%,rgba(139,92,246,0.10),transparent_34%)]" />
        <div className="relative">
        <h2 className="mx-auto max-w-3xl text-4xl font-black leading-tight md:text-5xl">
          {topCategory ? `Got a ${topCategory} piece to swap?` : "Ready to list your first item?"}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-semibold leading-relaxed text-slate-500">
          Upload your clothes, set swap points, and join the live marketplace
          flow powered by real products.
        </p>
        <Link to="/add-listing" className="button-primary mt-8 h-14 px-8">
          Start Listing <ArrowRight size={20} />
        </Link>
        </div>
      </div>
    </section>
  );
}
