import { MessageCircle, Recycle, ShieldCheck } from "lucide-react";

import useRotatingListings from "../../hooks/useRotatingListings";
import { marketplaceStats, uniqueLabels } from "../../utils/marketplaceHighlights";

export default function WhySwapWear() {
  const { allItems, loading } = useRotatingListings(6, { includeUnavailable: true });
  const stats = marketplaceStats(allItems);
  const topCategories = uniqueLabels(allItems, "category", 2, ["fashion"]);
  const topBrands = uniqueLabels(allItems, "brand", 2, ["trusted brands"]);
  const items = [
    {
      icon: Recycle,
      title: `${stats.availableItems || (loading ? "Live" : 0)} swappable items`,
      text: topCategories.length
        ? `Browse real uploaded ${topCategories.join(" and ")} pieces instead of static demo cards.`
        : "Upload products and this section will start reflecting live marketplace stock.",
    },
    {
      icon: ShieldCheck,
      title: `${stats.brandCount || (loading ? "Verified" : 0)} product brands`,
      text: topBrands.length
        ? `Listings are grouped around ${topBrands.join(" and ")} with owner details and structured swap history.`
        : "Owner details, profile data, and swap history make exchanges safer.",
    },
    {
      icon: MessageCircle,
      title: `${stats.averagePoints || (loading ? "Smart" : 0)} avg points`,
      text: "Compare condition, points, location, and chat before confirming any exchange.",
    },
  ];

  return (
    <section className="container-main py-16 md:py-20">
      <div className="grid gap-6 lg:grid-cols-3">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="premium-card interactive-lift rounded-[30px] p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-pink-50 text-pink-500 shadow-sm">
              <Icon size={30} />
            </div>
            <h3 className="mt-8 text-3xl font-black">{title}</h3>
            <p className="mt-4 text-lg font-medium leading-relaxed text-slate-500">
              {text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
