export default function SecondaryButton({
  children,
  className = "",
  disabled = false,
  ...props
}) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-full border border-pink-100 bg-white px-6 font-black text-pink-500 shadow-sm transition hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}