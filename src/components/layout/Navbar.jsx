import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";

import {
  Search,
  Menu,
  X,
  Recycle,
  Bell,
  Plus,
  ChevronDown,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { getCurrentProfile } from "../../services/profile";
import UserMenu from "./UserMenu";

const navItems = [
  { title: "Home", path: "/" },
  { title: "Explore", path: "/explore" },
  { title: "Swaps", path: "/swaps" },
  { title: "Chat", path: "/chat" },
  { title: "Dashboard", path: "/dashboard" },
];

const categories = [
  "Jackets",
  "Hoodies",
  "Sneakers",
  "Ethnic",
  "Streetwear",
  "Vintage",
];

export default function Navbar() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 20);
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setProfile(null);
        return;
      }

      const response = await getCurrentProfile();

      if (response.success) {
        setProfile(response.data);
      }
    }

    loadProfile();
  }, [user]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setProfileOpen(false);
    setMobileOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-50 px-3 pt-3">
        <div className="mx-auto max-w-[1800px]">
          <div
            className={`relative h-[82px] rounded-[34px] border border-white/45 bg-white/50 backdrop-blur-2xl px-5 md:px-7 flex items-center justify-between gap-5 transition-all duration-500 ${
              isScrolled
                ? "shadow-[0_24px_80px_rgba(255,105,180,0.22)]"
                : "shadow-[0_14px_50px_rgba(255,105,180,0.12)]"
            }`}
          >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#ff4fa3] to-[#ff7bc3] text-white flex items-center justify-center shadow-xl">
                <Recycle size={23} />
              </div>

              <div className="hidden sm:block">
                <h1 className="text-2xl font-black tracking-tight">
                  SwapWear
                </h1>
                <p className="text-xs text-[var(--muted)] font-semibold">
                  Sustainable Fashion
                </p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden xl:flex items-center gap-7">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `font-black text-sm transition ${
                      isActive
                        ? "text-[var(--accent)]"
                        : "text-[var(--text)] hover:text-[var(--accent)]"
                    }`
                  }
                >
                  {item.title}
                </NavLink>
              ))}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCategoryOpen(!categoryOpen)}
                  className="flex items-center gap-1 font-black text-sm hover:text-[var(--accent)] transition"
                >
                  Categories
                  <ChevronDown
                    size={16}
                    className={`transition ${categoryOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {categoryOpen && (
                  <div className="absolute left-0 top-10 w-[260px] rounded-[28px] bg-white/90 backdrop-blur-2xl border border-white/60 shadow-[0_24px_80px_rgba(255,105,180,0.18)] p-4">
                    {categories.map((cat) => (
                      <Link
                        key={cat}
                        to="/explore"
                        onClick={() => setCategoryOpen(false)}
                        className="block px-4 py-3 rounded-2xl font-bold hover:bg-pink-50 hover:text-[var(--accent)] transition"
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Search */}
            <div className="hidden lg:flex flex-1 max-w-[360px] h-14 rounded-full bg-white/55 border border-white/50 items-center px-5 shadow-sm">
              <Search size={18} className="text-[var(--muted)] shrink-0" />
              <input
                type="text"
                placeholder="Search fashion..."
                className="w-full bg-transparent outline-none px-3 text-sm font-semibold"
              />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button className="hidden md:flex w-12 h-12 rounded-full bg-white/55 border border-white/50 items-center justify-center hover:bg-pink-50 transition relative">
                <Bell size={19} />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-pink-500"></span>
              </button>

              <NavLink
                to="/add-listing"
                className="hidden md:flex h-13 px-5 py-3 rounded-full bg-gradient-to-r from-[#ff4fa3] to-[#ff7bc3] text-white items-center gap-2 font-black shadow-[0_12px_34px_rgba(255,105,180,0.35)] hover:scale-[1.03] transition"
              >
                <Plus size={18} />
                List Item
              </NavLink>

              {user ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="w-13 h-13 rounded-full overflow-hidden bg-gradient-to-r from-[#ff4fa3] to-[#ff7bc3] text-white flex items-center justify-center font-black text-xl shadow-xl"
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (profile?.full_name || user?.email || "U")
                        .charAt(0)
                        .toUpperCase()
                    )}
                  </button>

                  <UserMenu
                    user={user}
                    profile={profile}
                    open={profileOpen}
                    onLogout={handleLogout}
                  />
                </div>
              ) : (
                <NavLink
                  to="/auth"
                  className="hidden md:flex h-13 px-6 py-3 rounded-full bg-white/55 border border-white/50 items-center justify-center font-black hover:bg-pink-50 transition"
                >
                  Login
                </NavLink>
              )}

              <button
                onClick={() => setMobileOpen(true)}
                className="xl:hidden w-12 h-12 rounded-full bg-white/55 border border-white/50 flex items-center justify-center"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-[100] xl:hidden transition ${
          mobileOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        <aside
          className={`absolute right-0 top-0 h-full w-[88%] max-w-[430px] bg-white/90 backdrop-blur-2xl border-l border-white/60 shadow-2xl transition-transform duration-500 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-24 px-6 border-b border-gray-100 flex items-center justify-between">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#ff4fa3] to-[#ff7bc3] text-white flex items-center justify-center">
                <Recycle size={22} />
              </div>
              <h2 className="text-2xl font-black">SwapWear</h2>
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center"
            >
              <X size={22} />
            </button>
          </div>

          <div className="p-6">
            {user && (
              <div className="mb-6 p-4 rounded-[28px] bg-pink-50 border border-pink-100 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-[#ff4fa3] to-[#ff7bc3] text-white flex items-center justify-center font-black text-2xl">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (profile?.full_name || user?.email || "U")
                      .charAt(0)
                      .toUpperCase()
                  )}
                </div>

                <div>
                  <h3 className="font-black">
                    {profile?.full_name || "SwapWear User"}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            <div className="h-14 rounded-full bg-gray-50 border border-gray-100 flex items-center px-5">
              <Search size={18} className="text-gray-400" />
              <input
                placeholder="Search..."
                className="w-full bg-transparent outline-none px-3"
              />
            </div>

            <div className="mt-8 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className="block px-5 py-4 rounded-2xl bg-gray-50 hover:bg-pink-50 font-black transition"
                >
                  {item.title}
                </Link>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="h-12 rounded-full bg-pink-50 text-[var(--accent)] flex items-center justify-center font-black"
                  >
                    Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center font-black"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="col-span-2 h-12 rounded-full bg-pink-50 text-[var(--accent)] flex items-center justify-center font-black"
                >
                  Login
                </Link>
              )}

              <Link
                to="/add-listing"
                onClick={() => setMobileOpen(false)}
                className="col-span-2 h-12 rounded-full bg-gradient-to-r from-[#ff4fa3] to-[#ff7bc3] text-white flex items-center justify-center font-black shadow-lg"
              >
                List Item
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}