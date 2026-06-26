import { Heart } from "lucide-react";

export default function Wishlist() {
  return (
    <section className="section-space pt-28">
      <div className="container-main">
        <div className="rounded-[42px] bg-white/60 backdrop-blur-2xl border border-white/50 p-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="w-16 h-16 rounded-2xl bg-pink-100 text-pink-500 flex items-center justify-center">
            <Heart size={28} />
          </div>

          <h1 className="mt-6 text-5xl font-black tracking-[-2px]">
            Wishlist
          </h1>

          <p className="mt-4 text-[var(--muted)] text-lg">
            Saved fashion items will appear here.
          </p>
        </div>
      </div>
    </section>
  );
}