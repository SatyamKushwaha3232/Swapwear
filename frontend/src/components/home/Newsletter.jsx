import { Mail } from "lucide-react";

export default function Newsletter() {
  return (
    <section className="container-main py-12 md:py-16">
      <div className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-500 p-8 text-white shadow-[0_30px_90px_rgba(255,79,163,0.30)] md:p-12">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.18),transparent_36%)]" />

        <div className="relative">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-black leading-tight md:text-5xl">
              Never miss the next good swap.
            </h2>
            <p className="mt-4 text-lg font-medium leading-relaxed text-white/82">
              Join the SwapWear community and discover new listings first.
            </p>
          </div>

          <div className="mt-8 flex max-w-2xl flex-col gap-3 rounded-[28px] bg-white/95 p-2 shadow-2xl sm:rounded-full md:flex-row">
            <div className="flex h-13 min-w-0 flex-1 items-center px-5 text-slate-500">
              <Mail size={20} className="shrink-0 text-pink-500" />
              <input
                placeholder="Enter your email"
                className="min-w-0 flex-1 px-4 font-bold text-slate-800 outline-none"
              />
            </div>
            <button className="h-13 rounded-full bg-slate-950 px-7 font-black text-white transition hover:bg-pink-500">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
