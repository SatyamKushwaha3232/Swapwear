import { Recycle, Mail, ArrowUpRight, Sparkles } from "lucide-react";
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
      { label: "Login", path: "/login" },
      { label: "Admin Panel", path: "/admin" },
      { label: "Saved Items", path: "/explore" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Eco Impact", path: "/explore" },
      { label: "Reuse Fashion", path: "/explore" },
      { label: "Groups", path: "/explore" },
      { label: "Swap Guide", path: "/explore" },
    ],
  },
];

const socialLinks = ["IG", "X", "IN", "GH"];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden pt-10 pb-8">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-50/60 to-white/70"></div>
      <div className="absolute -top-40 right-[-120px] w-[420px] h-[420px] rounded-full bg-pink-300 blur-3xl opacity-25"></div>
      <div className="absolute bottom-[-160px] left-[-120px] w-[420px] h-[420px] rounded-full bg-yellow-200 blur-3xl opacity-30"></div>

      <div className="container-main relative">
        <div className="rounded-[48px] bg-white/55 backdrop-blur-2xl border border-white/50 shadow-[0_30px_100px_rgba(15,23,42,0.08)] p-8 md:p-12">
          <div className="grid lg:grid-cols-[1.1fr_1.9fr] gap-14">
            <div>
              <Link to="/" className="inline-flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-[0_14px_40px_rgba(255,105,180,0.32)]">
                  <Recycle size={28} />
                </div>

                <div>
                  <h2 className="text-5xl font-black tracking-tight">
                    SwapWear
                  </h2>

                  <p className="text-[var(--muted)] font-semibold mt-1">
                    Sustainable Fashion Marketplace
                  </p>
                </div>
              </Link>

              <p className="mt-8 text-lg text-[var(--muted)] leading-relaxed max-w-lg">
                SwapWear helps people exchange fashion items sustainably through
                modern clothing swaps, verified communities, negotiation chat,
                and premium multi-angle product listings.
              </p>

              <Link
                to="/add-listing"
                className="mt-8 inline-flex items-center gap-2 px-7 py-4 rounded-full bg-pink-400/35 backdrop-blur-xl border border-white/50 font-black hover:bg-pink-400/50 transition shadow-[0_12px_34px_rgba(255,105,180,0.20)]"
              >
                Start Swapping
                <ArrowUpRight size={19} />
              </Link>
            </div>

            <div className="grid sm:grid-cols-3 gap-10">
              {footerLinks.map((group) => (
                <div key={group.title}>
                  <h3 className="text-xl font-black mb-5">{group.title}</h3>

                  <div className="space-y-4">
                    {group.links.map((link) => (
                      <Link
                        key={link.label}
                        to={link.path}
                        className="block text-[var(--muted)] hover:text-[var(--accent)] transition font-semibold"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 rounded-[40px] bg-pink-400/16 backdrop-blur-2xl border border-white/50 p-7 md:p-9 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/55 border border-white/50 font-black text-sm">
                <Sparkles size={15} />
                Weekly fashion updates
              </div>

              <h3 className="mt-5 text-4xl font-black tracking-tight">
                Join the fashion swap movement.
              </h3>

              <p className="mt-3 text-[var(--muted)] text-lg">
                Get updates on new drops, nearby swaps, and sustainability tips.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="h-16 bg-white/60 backdrop-blur-xl border border-white/50 rounded-full flex items-center px-5 min-w-0 sm:min-w-[340px]">
                <Mail size={19} className="text-[var(--muted)] shrink-0" />

                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-transparent outline-none px-3"
                />
              </div>

              <button className="h-16 px-8 rounded-full bg-pink-400/35 backdrop-blur-xl border border-white/50 font-black hover:bg-pink-400/50 transition shadow-[0_12px_34px_rgba(255,105,180,0.20)]">
                Subscribe
              </button>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/50 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <p className="text-[var(--muted)] font-semibold">
              © 2026 SwapWear — Designed & Developed by Satyam Kushwaha
            </p>

            <div className="flex items-center gap-3">
              {socialLinks.map((label) => (
                <button
                  key={label}
                  className="w-12 h-12 rounded-full bg-white/60 backdrop-blur-xl border border-white/50 flex items-center justify-center hover:bg-pink-400/30 transition font-black"
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
