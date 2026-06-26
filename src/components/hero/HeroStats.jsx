/* =========================================
   Hero Stats
========================================= */

const stats = [
  {
    value: "12K+",
    label: "Active Swappers",
  },
  {
    value: "8K+",
    label: "Successful Swaps",
  },
  {
    value: "24T",
    label: "CO₂ Saved",
  },
];

export default function HeroStats() {
  return (
    <div className="mt-14 grid grid-cols-3 gap-8 max-w-2xl">

      {stats.map((stat) => (

        <div key={stat.label}>

          <h3 className="text-4xl md:text-5xl font-black tracking-tight">
            {stat.value}
          </h3>

          <p className="mt-3 text-[15px] md:text-base text-[var(--muted)] font-semibold">
            {stat.label}
          </p>

        </div>

      ))}

    </div>
  );
}