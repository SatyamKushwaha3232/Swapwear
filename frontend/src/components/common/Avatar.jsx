export default function Avatar({
  name = "User",
  src = "",
  size = "h-12 w-12",
  className = "",
}) {
  return (
    <div
      className={`relative flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 font-black text-white ${className}`}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}

      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
    </div>
  );
}