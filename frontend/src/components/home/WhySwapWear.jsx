import { MessageCircle, Recycle, ShieldCheck } from "lucide-react";

const items = [
  {
    icon: Recycle,
    title: "Swap, don't waste",
    text: "Refresh your wardrobe while keeping wearable fashion in use.",
  },
  {
    icon: ShieldCheck,
    title: "Trust-first profiles",
    text: "Owner details, profile data, and swap history make exchanges safer.",
  },
  {
    icon: MessageCircle,
    title: "Chat before swap",
    text: "Discuss condition, value, and location before confirming any request.",
  },
];

export default function WhySwapWear() {
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
