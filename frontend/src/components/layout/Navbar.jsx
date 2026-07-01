import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Bell,
  Heart,
  Menu,
  MessageCircle,
  Plus,
  X,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { getCurrentProfile } from "../../services/profile";
import {
  getNotifications,
  markNotificationRead,
} from "../../services/notifications";

import Logo from "./Logo";
import NavLinks from "./NavLinks";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";

const categories = [
  "Jackets",
  "Hoodies",
  "Sneakers",
  "Ethnic Wear",
  "Streetwear",
  "Vintage",
  "Luxury",
  "Accessories",
];

export default function Navbar() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

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

  useEffect(() => {
    async function loadNotifications() {
      if (!user?.id) {
        setNotifications([]);
        return;
      }

      const response = await getNotifications(user.id);

      if (response.success) {
        setNotifications(response.data || []);
      }
    }

    loadNotifications();
  }, [user]);

  async function handleLogout() {
    await supabase.auth.signOut();
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

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-[999] px-3 pt-3 md:px-5 md:pt-4">
        <div className="mx-auto w-full max-w-[1440px]">
          <div
            className={`relative flex min-w-0 items-center gap-3 rounded-[26px] border border-white/80 bg-white/90 px-4 backdrop-blur-2xl transition-all duration-300 md:gap-4 md:px-5 ${
              scrolled
                ? "h-[68px] shadow-[0_18px_50px_rgba(255,79,163,0.18)]"
                : "h-[74px] shadow-[0_16px_45px_rgba(255,79,163,0.12)]"
            }`}
          >
            <Logo />

            <NavLinks onCategories={() => setCategoryOpen((prev) => !prev)} />

            {categoryOpen && (
              <div className="absolute left-1/2 top-[82px] z-[1000] w-[min(620px,calc(100vw-32px))] -translate-x-1/2 rounded-[30px] border border-pink-100 bg-white/95 p-5 shadow-[0_30px_80px_rgba(255,79,163,0.2)] backdrop-blur-2xl">
                <div className="flex items-center gap-2 font-black text-pink-500">
                  <Sparkles size={18} />
                  Explore Categories
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {categories.map((item) => (
                    <Link
                      key={item}
                      to="/explore"
                      onClick={() => setCategoryOpen(false)}
                      className="rounded-2xl bg-pink-50/70 px-4 py-3 text-sm font-black transition hover:bg-pink-100 hover:text-pink-500"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="hidden min-w-0 flex-1 lg:block">
              <SearchBar />
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-2">
              <IconButton to="/wishlist" icon={Heart} />
              <IconButton to="/chat" icon={MessageCircle} />

              <div className="relative hidden min-[1280px]:block">
                <button
                  type="button"
                  onClick={() => setNotifyOpen((prev) => !prev)}
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border border-pink-100 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:bg-pink-50"
                >
                  <Bell size={19} />

                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-500 px-1 text-[11px] font-black text-white ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifyOpen && (
                  <div className="absolute right-0 top-[62px] w-[min(360px,calc(100vw-32px))] rounded-[28px] border border-pink-100 bg-white/95 p-4 shadow-[0_28px_80px_rgba(255,79,163,0.2)]">
                    <h3 className="text-lg font-black">Notifications</h3>

                    <div className="mt-4 space-y-3">
                      {notifications.length === 0 ? (
                        <div className="rounded-2xl bg-pink-50/70 p-4">
                          <h4 className="text-sm font-black">
                            No notifications
                          </h4>
                          <p className="mt-1 text-sm text-slate-500">
                            Updates will appear here.
                          </p>
                        </div>
                      ) : (
                        notifications.slice(0, 6).map((notice) => (
                          <button
                            key={notice.id}
                            onClick={async () => {
                              await markNotificationRead(notice.id);

                              setNotifications((prev) =>
                                prev.map((item) =>
                                  item.id === notice.id
                                    ? { ...item, is_read: true }
                                    : item
                                )
                              );
                            }}
                            className={`w-full rounded-2xl p-4 text-left transition ${
                              notice.is_read ? "bg-slate-50" : "bg-pink-50"
                            }`}
                          >
                            <h4 className="text-sm font-black">
                              {notice.title}
                            </h4>
                            <p className="mt-1 text-sm text-slate-500">
                              {notice.message}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <NavLink
                to="/add-listing"
                className="hidden h-11 items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-5 text-sm font-black text-white shadow-[0_14px_32px_rgba(255,79,163,0.32)] transition hover:-translate-y-0.5 min-[1280px]:flex"
              >
                <Plus size={18} />
                Sell Item
              </NavLink>

              {user ? (
                <div className="relative hidden min-[1280px]:block">
                  <button
                    type="button"
                    onClick={() => setProfileOpen((prev) => !prev)}
                    className="h-11 w-11 overflow-hidden rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-base font-black text-white shadow-xl ring-4 ring-pink-100 transition hover:scale-105"
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
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
                  className="hidden h-11 items-center rounded-full border border-pink-100 bg-white px-5 text-sm font-black shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:bg-pink-50 min-[1280px]:flex"
                >
                  Login
                </NavLink>
              )}

              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-pink-100 bg-white shadow-md min-[1280px]:hidden"
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
          className={`absolute right-0 top-0 h-full w-[88%] max-w-[430px] overflow-y-auto border-l border-pink-100 bg-white/95 shadow-2xl backdrop-blur-2xl transition-transform duration-500 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-24 items-center justify-between border-b border-pink-50 px-6">
            <Logo />

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-50"
            >
              <X size={22} />
            </button>
          </div>

          <div className="p-6">
            {user && (
              <div className="mb-6 flex items-center gap-4 rounded-[28px] border border-pink-100 bg-pink-50 p-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-2xl font-black text-white">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
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
                className="col-span-2 flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 font-black text-white shadow-lg"
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
      className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-pink-100 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:bg-pink-50 min-[1280px]:flex"
    >
      <Icon size={19} />
    </NavLink>
  );
}