import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Heart,
  Menu,
  MessageCircle,
  Plus,
  X,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import useClickOutside from "../../hooks/useClickOutside";
import { getCurrentProfile } from "../../services/profile";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import NotificationBell from "./NotificationBell";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";
import useRotatingListings from "../../hooks/useRotatingListings";
import { categoryHighlights } from "../../utils/marketplaceHighlights";
import { resolveMediaUrl } from "../../utils/media";

export default function Navbar() {
  const { user, signOut } = useAuth();

  const [profile, setProfile] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const categoryRef = useRef(null);
  const profileRef = useRef(null);
  const { allItems } = useRotatingListings(8, { includeUnavailable: true });
  const categories = categoryHighlights(allItems, 8);

  useClickOutside(categoryRef, () => setCategoryOpen(false), categoryOpen);
  useClickOutside(profileRef, () => setProfileOpen(false), profileOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);

    onScroll();
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
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
    await signOut();
    setProfileOpen(false);
    setMobileOpen(false);
  }

  const avatarLetter = (
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    "U"
  )
    .charAt(0)
    .toUpperCase();
  const avatarUrl = resolveMediaUrl(profile?.avatar_url || user?.user_metadata?.avatar_url || "");

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-[999] px-3 pt-3 md:px-5 md:pt-4">
        <div className="mx-auto w-full max-w-[1440px]">
          <div
            className={`premium-surface relative flex min-w-0 items-center gap-3 rounded-[26px] px-4 transition-all duration-300 md:gap-4 md:px-5 ${
              scrolled
                ? "h-[68px]"
                : "h-[74px]"
            }`}
          >
            <Logo />

            <div ref={categoryRef} className="contents">
              <NavLinks
                onCategories={() => {
                  setProfileOpen(false);
                  setCategoryOpen((prev) => !prev);
                }}
              />

              {categoryOpen && (
                <div
                  className="premium-surface z-[1000] w-[min(520px,calc(100vw-24px))] rounded-[28px] p-5"
                  style={{ position: "fixed", right: 20, top: 96 }}
                >
                  <div className="flex items-center gap-2 font-black text-pink-500">
                    <Sparkles size={18} />
                    Explore Categories
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {categories.length === 0 && (
                      <Link
                        to="/explore"
                        onClick={() => setCategoryOpen(false)}
                        className="interactive-lift min-w-0 truncate rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-sm font-black shadow-sm hover:bg-pink-50 hover:text-pink-500"
                      >
                        Browse Listings
                      </Link>
                    )}
                    {categories.map((item) => (
                      <Link
                        key={item.title}
                        to={`/explore?category=${encodeURIComponent(item.title)}`}
                        onClick={() => setCategoryOpen(false)}
                        className="interactive-lift min-w-0 truncate rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-sm font-black shadow-sm hover:bg-pink-50 hover:text-pink-500"
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden min-w-0 flex-1 lg:block">
              <SearchBar />
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-2">
              <IconButton to="/wishlist" icon={Heart} />
              <IconButton to="/chat" icon={MessageCircle} />

              {user && (
                <div className="hidden min-[1280px]:block">
                  <NotificationBell userId={user.id} />
                </div>
              )}

              <NavLink
                to="/add-listing"
                className="hidden h-11 items-center gap-2 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-500 px-5 text-sm font-black text-white shadow-[0_14px_32px_rgba(255,79,163,0.32)] transition hover:-translate-y-0.5 min-[1280px]:flex"
              >
                <Plus size={18} />
                Sell Item
              </NavLink>

              {user ? (
                <div ref={profileRef} className="relative hidden min-[1280px]:block">
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryOpen(false);
                      setProfileOpen((prev) => !prev);
                    }}
                    className="h-11 w-11 overflow-hidden rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-500 text-base font-black text-white shadow-xl ring-4 ring-pink-100 transition hover:scale-105"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      avatarLetter
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
                  to="/login"
                  className="hidden h-11 items-center rounded-full border border-white/80 bg-white/80 px-5 text-sm font-black shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:bg-pink-50 min-[1280px]:flex"
                >
                  Login
                </NavLink>
              )}

              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/80 shadow-md transition hover:bg-pink-50 min-[1280px]:hidden"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[1000] transition min-[1280px]:hidden ${
          mobileOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        />

        <aside
          className={`absolute right-0 top-0 h-full w-[88%] max-w-[430px] overflow-y-auto border-l border-white/70 bg-white/95 shadow-2xl backdrop-blur-2xl transition-transform duration-500 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-24 items-center justify-between border-b border-pink-50 px-6">
            <Logo />

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="button-quiet h-11 min-h-0 w-11 rounded-full p-0"
            >
              <X size={22} />
            </button>
          </div>

          <div className="p-6">
            {user && (
              <div className="premium-card mb-6 flex items-center gap-4 rounded-[28px] p-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-2xl font-black text-white">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    avatarLetter
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate font-black">
                    {profile?.full_name || "SwapWear User"}
                  </h3>
                  <p className="truncate text-sm text-slate-500">
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {user && (
                <NotificationBell
                  userId={user.id}
                  variant="sheet"
                  onNavigate={() => setMobileOpen(false)}
                />
              )}

              {[
                ["/", "Discover"],
                ["/explore", "Browse"],
                ["/dashboard", "Dashboard"],
                ["/profile", "Profile"],
                ["/wishlist", "Wishlist"],
                ["/swaps", "Swap Requests"],
                ["/chat", "Messages"],
              ].map(([to, label]) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-2xl bg-slate-50 px-5 py-4 font-black transition hover:bg-pink-50 hover:text-pink-500"
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="col-span-2 h-12 rounded-full bg-red-50 font-black text-red-600"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="col-span-2 flex h-12 items-center justify-center rounded-full bg-pink-50 font-black text-pink-500"
                >
                  Login
                </Link>
              )}

              <Link
                to="/add-listing"
                onClick={() => setMobileOpen(false)}
                className="button-primary col-span-2 h-12"
              >
                Sell Item
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

function IconButton({ to, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/80 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:bg-pink-50 min-[1280px]:flex"
    >
      <Icon size={19} />
    </NavLink>
  );
}
