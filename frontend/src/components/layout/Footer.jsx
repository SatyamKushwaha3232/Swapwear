import { ArrowUpRight, Recycle } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = [
  { label: "Explore", path: "/explore" },
  { label: "Add Listing", path: "/add-listing" },
  { label: "Swaps", path: "/swaps" },
  { label: "Chat", path: "/chat" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Profile", path: "/profile" },
];

const socialLinks = ["IG", "X", "IN", "GH"];

export default function Footer() {
  return (
    <footer className="px-3 pb-4 pt-3 md:px-5 md:pb-5">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[34px] bg-slate-950 text-white shadow-[0_32px_100px_rgba(15,23,42,0.22)] md:rounded-[42px]">
        <div className="relative p-6 md:p-9 xl:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(255,79,163,0.24),transparent_32%),radial-gradient(circle_at_90%_90%,rgba(139,92,246,0.16),transparent_34%)]" />

          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end">
            <div>
              <Link to="/" className="inline-flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-500 text-white shadow-[0_18px_46px_rgba(255,79,163,0.28)]">
                  <Recycle size={26} />
                </div>
                <div>
                  <h2 className="text-4xl font-black">SwapWear</h2>
                  <p className="mt-1 font-semibold text-white/54">
                    Sustainable Fashion Marketplace
                  </p>
                </div>
              </Link>

              <p className="mt-6 max-w-xl text-base font-semibold leading-relaxed text-white/60 md:text-lg">
                Swap pre-loved fashion, manage requests, chat with swappers, and
                keep good clothes in circulation.
              </p>

              <Link
                to="/add-listing"
                className="mt-7 inline-flex h-13 items-center gap-2 rounded-full bg-white px-6 font-black text-slate-950 transition hover:bg-pink-200"
              >
                Start Swapping
                <ArrowUpRight size={18} />
              </Link>
            </div>

            <div className="lg:text-right">
              <div className="flex flex-wrap gap-3 lg:justify-end">
                {footerLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.path}
                    className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-black text-white/68 transition hover:bg-white hover:text-slate-950"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-7 flex items-center gap-3 lg:justify-end">
                {socialLinks.map((label) => (
                  <button
                    key={label}
                    type="button"
                    title={label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/8 text-sm font-black text-white/68 transition hover:-translate-y-1 hover:bg-white hover:text-slate-950"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 text-sm font-semibold text-white/42 md:flex-row md:items-center md:justify-between">
            <p>© 2026 SwapWear - Designed & Developed by Satyam Kushwaha</p>
            <p>Reuse better. Swap smarter.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
