export default function PageHeader({
  badge,
  title,
  description,
  icon: Icon,
  actions,
}) {
  return (
    <div className="mb-6 rounded-[34px] border border-white/70 bg-white/75 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl md:p-8">
      {badge && (
        <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-5 py-2 font-black text-pink-500">
          {Icon && <Icon size={17} />}
          {badge}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-[clamp(38px,5vw,72px)] font-black leading-[0.96] tracking-[-3px]">
            {title}
          </h1>

          {description && (
            <p className="mt-5 max-w-3xl font-semibold leading-relaxed text-[var(--muted)] md:text-lg">
              {description}
            </p>
          )}
        </div>

        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </div>
  );
}