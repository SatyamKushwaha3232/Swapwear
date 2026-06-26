import { Link, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  Shirt,
  Plus,
  Repeat2,
  MessageCircle,
  Shield,
  Settings,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const links = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Explore Items",
    path: "/explore",
    icon: Shirt,
  },
  {
    name: "Add Listing",
    path: "/add-listing",
    icon: Plus,
  },
  {
    name: "Swap Requests",
    path: "/swaps",
    icon: Repeat2,
  },
  {
    name: "Messages",
    path: "/chat",
    icon: MessageCircle,
  },
  {
    name: "Admin Panel",
    path: "/admin",
    icon: Shield,
  },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden xl:block w-[310px] shrink-0">
      <div className="sticky top-28">
        <div className="relative overflow-hidden rounded-[42px] bg-white/55 backdrop-blur-2xl border border-white/50 shadow-[0_24px_80px_rgba(15,23,42,0.08)] p-5">
          {/* FLOATING BACKGROUND */}
          <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-pink-400 blur-3xl opacity-20"></div>

          {/* PROFILE */}
          <div className="relative rounded-[34px] bg-white/45 backdrop-blur-xl border border-white/50 p-6 overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] w-28 h-28 rounded-full bg-pink-300 blur-2xl opacity-30"></div>

            <div className="relative flex items-start gap-4">
              <div className="relative">
                <div className="w-18 h-18 rounded-full bg-[var(--accent-soft)] border border-white/50 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-black text-[var(--accent)]">
                    S
                  </span>
                </div>

                <span className="absolute right-0 bottom-1 w-4 h-4 rounded-full bg-[var(--green)] border-2 border-white"></span>
              </div>

              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-400/20 border border-pink-300/30 text-[11px] font-black text-[var(--accent)]">
                  <Sparkles size={12} />
                  PREMIUM USER
                </div>

                <h3 className="mt-3 text-2xl font-black leading-tight">
                  Satyam Kushwaha
                </h3>

                <p className="mt-1 text-sm text-[var(--muted)] font-semibold">
                  Verified sustainable swapper
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-[22px] bg-white/60 border border-white/50 p-4">
                <h4 className="text-2xl font-black">18</h4>

                <p className="mt-1 text-xs text-[var(--muted)] font-semibold">
                  Swaps
                </p>
              </div>

              <div className="rounded-[22px] bg-white/60 border border-white/50 p-4">
                <h4 className="text-2xl font-black">4.8</h4>

                <p className="mt-1 text-xs text-[var(--muted)] font-semibold">
                  Rating
                </p>
              </div>
            </div>
          </div>

          {/* NAVIGATION */}
          <nav className="relative mt-5 space-y-2">
            {links.map((link) => {
              const Icon = link.icon;

              const active = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    group
                    flex items-center justify-between
                    px-5 py-4
                    rounded-[24px]
                    transition-all duration-300
                    ${
                      active
                        ? `
                          bg-pink-400/35
                          backdrop-blur-xl
                          border border-white/50
                          shadow-[0_12px_34px_rgba(255,105,180,0.18)]
                        `
                        : `
                          hover:bg-white/45
                          hover:backdrop-blur-xl
                          hover:border hover:border-white/50
                        `
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`
                        w-11 h-11 rounded-2xl
                        flex items-center justify-center
                        transition
                        ${
                          active
                            ? "bg-white/55"
                            : "bg-white/35 group-hover:bg-white/55"
                        }
                      `}
                    >
                      <Icon size={20} />
                    </div>

                    <span className="font-black">
                      {link.name}
                    </span>
                  </div>

                  <ChevronRight
                    size={18}
                    className={`
                      transition
                      ${
                        active
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                      }
                    `}
                  />
                </Link>
              );
            })}
          </nav>

          {/* SETTINGS */}
          <div className="relative mt-6">
            <button
              className="
                w-full
                flex items-center justify-between
                px-5 py-4
                rounded-[24px]
                bg-white/45
                backdrop-blur-xl
                border border-white/50
                font-black
                hover:bg-pink-400/20
                transition-all
              "
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-white/55 flex items-center justify-center">
                  <Settings size={20} />
                </div>

                Settings
              </div>

              <ChevronRight size={18} />
            </button>
          </div>

          {/* PREMIUM CARD */}
          <div className="relative mt-6 rounded-[34px] bg-pink-400/18 backdrop-blur-2xl border border-white/50 p-6 overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-pink-400 blur-3xl opacity-20"></div>

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/55 border border-white/50 text-xs font-black">
                <Sparkles size={12} />
                PREMIUM
              </div>

              <h3 className="mt-4 text-2xl font-black leading-tight">
                Boost your listing visibility.
              </h3>

              <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
                Get highlighted placement in explore feeds and premium swap recommendations.
              </p>

              <button className="mt-5 h-12 px-5 rounded-full bg-white/60 backdrop-blur-xl border border-white/50 font-black hover:bg-white transition">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}