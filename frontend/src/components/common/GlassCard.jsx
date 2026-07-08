export default function GlassCard({
  children,
  className = "",
  padding = "p-6 md:p-8",
}) {
  return (
    <div
      className={`rounded-[34px] border border-white/70 bg-white/75 ${padding} shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl ${className}`}
    >
      {children}
    </div>
  );
}