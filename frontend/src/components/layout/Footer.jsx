import { ArrowUpRight, Mail, Recycle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = [
  {
    title: "Marketplace",
    links: [
      { label: "Explore Items", path: "/explore" },
      { label: "Add Listing", path: "/add-listing" },
      { label: "Swap Requests", path: "/swaps" },
      { label: "Messages", path: "/chat" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Dashboard", path: "/dashboard" },
      { label: "Profile", path: "/profile" },
      { label: "Wishlist", path: "/wishlist" },
      { label: "Settings", path: "/settings" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Eco Impact", path: "/explore" },
      { label: "Reuse Fashion", path: "/explore" },
      { label: "Swap Guide", path: "/explore" },
      { label: "Admin Panel", path: "/admin" },
    ],
  },
];

const socialLinks = ["IG", "X", "IN", "GH"];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden px-3 pb-4 pt-5 md:px-5 md:pb-5">
      <div className="relative mx-auto max-w-[1500px] overflow-hidden rounded-[38px] bg-slate-950 text-white shadow-[0_42px_120px_rgba(15,23,42,0.28)] md:rounded-[48px]">
        <img
          src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1900&q=85"
          alt="SwapWear footer editorial"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(255,79,163,0.30),transparent_34%),radial-gradient(circle_at_85%_82%,rgba(139,92,246,0.22),transparent_34%),linear-gradient(180deg,rgba(7,7,25,0.92),rgba(7,7,25,0.98))]" />

        <div className="relative p-6 md:p-10 xl:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-5 py-2 text-sm font-black text-pink-200 backdrop-blur-xl">
                <Sparkles size={15} />
                SwapWear Marketplace
              </div>

              <h2 className="mt-6 max-w-4xl text-[clamp(42px,6vw,86px)] font-black leading-[0.9]">
                Make your wardrobe feel new again.
              </h2>

              <p className="mt-5 max-w-2xl text-lg font-semibold leading-relaxed text-white/66">
                SwapWear brings product listings, swap requests, chat, wishlist,
                and sustainability impact into one polished fashion exchange.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/add-listing" className="button-primary h-14 px-7">
                  Start Swapping
                  <ArrowUpRight size={19} />
                </Link>
                <Link
                  to="/explore"
                  className="inline-flex h-14 items-center justify-center rounded-full border border-white/14 bg-white/10 px-7 font-black text-white backdrop-blur-xl transition hover:bg-white hover:text-slate-950"
                >
                  Explore Items
                </Link>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/14 bg-white/10 p-4 shadow-2xl backdrop-blur-2xl md:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-300/18 text-pink-200">
                  <Mail size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-black">Weekly fashion drops</h3>
                  <p className="text-sm font-semibold text-white/54">
                    New swaps, nearby items, and eco tips.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 rounded-[26px] bg-white p-2 sm:rounded-full md:flex-row">
                <div className="flex h-12 min-w-0 flex-1 items-center px-4">
                  <Mail size={18} className="shrink-0 text-pink-500" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="min-w-0 flex-1 bg-transparent px-3 font-bold text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>

                <button className="h-12 rounded-full bg-slate-950 px-6 font-black text-white transition hover:bg-pink-500">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-8 border-t border-white/10 pt-9 lg:grid-cols-[1fr_1.35fr]">
            <Link to="/" className="group inline-flex max-w-max items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-500 text-white shadow-[0_18px_46px_rgba(255,79,163,0.28)] transition group-hover:scale-105">
                <Recycle size={29} />
              </div>

              <div>
                <h3 className="text-4xl font-black">SwapWear</h3>
                <p className="mt-1 font-semibold text-white/56">
                  Sustainable Fashion Marketplace
                </p>
              </div>
            </Link>

            <div className="grid gap-8 sm:grid-cols-3">
              {footerLinks.map((group) => (
                <div key={group.title}>
                  <h4 className="font-black text-white">{group.title}</h4>

                  <div className="mt-4 space-y-3">
                    {group.links.map((link) => (
                      <Link
                        key={link.label}
                        to={link.path}
                        className="block font-semibold text-white/56 transition hover:translate-x-1 hover:text-pink-200"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-5 border-t border-white/10 pt-7 md:flex-row md:items-center md:justify-between">
            <p className="font-semibold text-white/48">
              © 2026 SwapWear - Designed & Developed by Satyam Kushwaha
            </p>

            <div className="flex items-center gap-3">
              {socialLinks.map((label) => (
                <button
                  key={label}
                  type="button"
                  title={label}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-white/10 text-sm font-black text-white/70 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white hover:text-slate-950"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
