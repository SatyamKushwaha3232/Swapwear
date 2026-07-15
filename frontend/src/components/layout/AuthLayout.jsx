import { Outlet, Link } from "react-router-dom";
import { Recycle, Sparkles, ShieldCheck, ArrowLeft } from "lucide-react";

export default function AuthLayout() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-fuchsia-50">
      <div className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-pink-300/40 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-fuchsia-300/35 blur-3xl" />
      <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />

      <header className="relative z-10 px-6 py-6">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white shadow-xl">
              <Recycle size={26} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-[-1px] text-slate-950">
                SwapWear
              </h1>
              <p className="text-xs font-black uppercase tracking-[1px] text-slate-500">
                Sustainable Marketplace
              </p>
            </div>
          </Link>

          <Link
            to="/"
            className="hidden sm:inline-flex h-12 items-center gap-2 rounded-full border border-pink-100 bg-white/70 px-5 font-black shadow-md backdrop-blur-xl hover:bg-pink-50 transition"
          >
            <ArrowLeft size={18} />
            Back Home
          </Link>
        </div>
      </header>

      <section className="relative z-10 px-6 pb-8">
        <div className="mx-auto max-w-[1320px]">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
            <Badge icon={ShieldCheck} text="Secure Backend Auth" />
            <Badge icon={Sparkles} text="Premium Swap Experience" />
            <Badge icon={Recycle} text="Sustainable Fashion" />
          </div>

          <Outlet />
        </div>
      </section>
    </main>
  );
}

function Badge({ icon: Icon, text }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-black text-slate-700 shadow-sm backdrop-blur-xl">
      <Icon size={16} className="text-pink-500" />
      {text}
    </div>
  );
}
