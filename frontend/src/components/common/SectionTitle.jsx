/* =========================================
   Premium Section Title
========================================= */

export default function SectionTitle({
  badge,
  title,
  description,
  align = "left",
}) {
  const isCenter = align === "center";

  return (
    <div
      className={`max-w-3xl ${
        isCenter ? "mx-auto text-center" : ""
      }`}
    >

      {/* BADGE */}
      {badge && (
        <div className="inline-flex px-5 py-2 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-black text-sm">
          {badge}
        </div>
      )}

      {/* TITLE */}
      <h2 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-black tracking-[-2px] leading-[1.02] text-balance">
        {title}
      </h2>

      {/* DESCRIPTION */}
      {description && (
        <p className="mt-5 text-lg text-[var(--muted)] leading-relaxed">
          {description}
        </p>
      )}

    </div>
  );
}