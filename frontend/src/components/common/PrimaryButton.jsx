export default function PrimaryButton({
  children,
  className = "",
  disabled = false,
  ...props
}) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-6 font-black text-white shadow-[0_14px_34px_rgba(255,79,163,0.30)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}