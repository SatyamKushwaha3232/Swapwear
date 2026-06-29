import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Bell, Heart, Menu, MessageCircle, Plus, X, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { getCurrentProfile } from "../../services/profile";
import { getNotifications, markNotificationRead } from "../../services/notifications";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";
const categories = ["Jackets", "Hoodies", "Sneakers", "Ethnic Wear", "Streetwear", "Vintage", "Luxury", "Accessories"];
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
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 15); onScroll(); window.addEventListener("scroll", onScroll); return () => window.removeEventListener("scroll", onScroll); }, []);
  useEffect(() => { async function loadProfile() { if (!user) { setProfile(null); return; } const response = await getCurrentProfile(); if (response.success) setProfile(response.data); } loadProfile(); }, [user]);
  useEffect(() => {
    async function loadNotifications() {
      if (!user?.id) {
        setNotifications([]);
        return;
      }

      const response = await getNotifications(user.id);

      if (response.success) {
        setNotifications(response.data);
      }
    }

    loadNotifications();
  }, [user]);
  async function handleLogout() { await supabase.auth.signOut(); setProfileOpen(false); setMobileOpen(false); }
  const avatarLetter = (profile?.full_name || user?.user_metadata?.full_name || user?.email || "U").charAt(0).toUpperCase();
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[999] px-5 pt-5">
        <div className="mx-auto max-w-[1720px]">
          <div className={`relative flex items-center justify-between gap-5 rounded-[30px] border border-white/80 bg-white/82 px-6 md:px-8 backdrop-blur-2xl transition-all duration-500 ${scrolled ? "h-[72px] shadow-[0_22px_60px_rgba(255,79,163,0.20)]" : "h-[86px] shadow-[0_18px_55px_rgba(255,79,163,0.14)]"}`}>
            <Logo />
            <NavLinks onCategories={() => setCategoryOpen(!categoryOpen)} />
            {categoryOpen && <div className="absolute left-[360px] top-[82px] w-[620px] rounded-[34px] bg-white/95 backdrop-blur-2xl border border-pink-100 shadow-[0_32px_90px_rgba(255,79,163,0.22)] p-6 z-[1000]"><div className="flex items-center gap-2 text-pink-500 font-black"><Sparkles size={18} />Explore Categories</div><div className="mt-5 grid grid-cols-2 gap-3">{categories.map((item) => <Link key={item} to="/explore" onClick={() => setCategoryOpen(false)} className="rounded-2xl bg-pink-50/70 px-5 py-4 font-black hover:bg-pink-100 hover:text-pink-500 transition">{item}</Link>)}</div></div>}
            <SearchBar />
            <div className="flex items-center gap-3">
              <IconButton to="/wishlist" icon={Heart} />
              <IconButton to="/chat" icon={MessageCircle} />
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setNotifyOpen(!notifyOpen)}
                  className="relative h-12 w-12 flex items-center justify-center rounded-full border border-pink-100 bg-white shadow-[0_12px_26px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:shadow-xl transition"
                >
                  <Bell size={20} />

                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 min-w-5 h-5 rounded-full bg-pink-500 px-1 text-[11px] font-black text-white ring-2 ring-white flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifyOpen && (
                  <div className="absolute right-0 top-[68px] w-[360px] rounded-[30px] bg-white/95 border border-pink-100 shadow-[0_30px_90px_rgba(255,79,163,0.20)] p-4">
                    <h3 className="font-black text-lg">Notifications</h3>

                    <div className="mt-4 space-y-3">
                      {notifications.length === 0 ? (
                        <div className="rounded-2xl bg-pink-50/70 p-4">
                          <h4 className="font-black text-sm">No notifications</h4>
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
                                  item.id === notice.id ? { ...item, is_read: true } : item
                                )
                              );
                            }}
                            className={`w-full text-left rounded-2xl p-4 transition ${
                              notice.is_read ? "bg-slate-50" : "bg-pink-50"
                            }`}
                          >
                            <h4 className="font-black text-sm">{notice.title}</h4>
                            <p className="mt-1 text-sm text-slate-500">{notice.message}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <NavLink to="/add-listing" className="hidden md:flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-6 font-black text-white shadow-[0_16px_38px_rgba(255,79,163,0.35)] hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(255,79,163,0.45)] transition"><Plus size={19} />Sell Item</NavLink>
              {user ? <div className="relative hidden md:block"><button type="button" onClick={() => setProfileOpen(!profileOpen)} className="h-12 w-12 overflow-hidden rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-lg font-black text-white shadow-xl ring-4 ring-pink-100 hover:scale-105 transition">{profile?.avatar_url ? <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" /> : avatarLetter}</button><UserMenu user={user} profile={profile} open={profileOpen} onLogout={handleLogout} /></div> : <NavLink to="/login" className="hidden md:flex h-12 items-center rounded-full border border-pink-100 bg-white px-7 font-black shadow-[0_12px_26px_rgba(15,23,42,0.08)] hover:bg-pink-50 transition">Login</NavLink>}
              <button type="button" onClick={() => setMobileOpen(true)} className="xl:hidden h-12 w-12 rounded-full border border-pink-100 bg-white flex items-center justify-center shadow-md"><Menu size={23} /></button>
            </div>
          </div>
        </div>
      </header>
      <div className={`fixed inset-0 z-[1000] xl:hidden transition ${mobileOpen ? "visible opacity-100" : "invisible opacity-0"}`}><div onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/45 backdrop-blur-sm" /><aside className={`absolute right-0 top-0 h-full w-[88%] max-w-[430px] bg-white/95 backdrop-blur-2xl border-l border-pink-100 shadow-2xl transition-transform duration-500 ${mobileOpen ? "translate-x-0" : "translate-x-full"}`}><div className="h-24 px-6 flex items-center justify-between border-b border-pink-50"><Logo /><button onClick={() => setMobileOpen(false)} className="h-11 w-11 rounded-full bg-pink-50 flex items-center justify-center"><X size={22} /></button></div><div className="p-6">{user && <div className="mb-6 rounded-[30px] bg-pink-50 border border-pink-100 p-4 flex items-center gap-4"><div className="h-16 w-16 rounded-full overflow-hidden bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white flex items-center justify-center font-black text-2xl">{profile?.avatar_url ? <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" /> : avatarLetter}</div><div className="min-w-0"><h3 className="truncate font-black">{profile?.full_name || "SwapWear User"}</h3><p className="truncate text-sm text-slate-500">{user.email}</p></div></div>}<div className="space-y-3">{[["/", "Discover"], ["/explore", "Browse"], ["/dashboard", "Dashboard"], ["/profile", "Profile"], ["/wishlist", "Wishlist"], ["/swaps", "Swap Requests"], ["/chat", "Messages"]].map(([to, label]) => <Link key={to} to={to} onClick={() => setMobileOpen(false)} className="block rounded-2xl bg-slate-50 px-5 py-4 font-black hover:bg-pink-50 hover:text-pink-500 transition">{label}</Link>)}</div><div className="mt-8 grid grid-cols-2 gap-3">{user ? <button onClick={handleLogout} className="col-span-2 h-12 rounded-full bg-red-50 font-black text-red-600">Logout</button> : <Link to="/login" onClick={() => setMobileOpen(false)} className="col-span-2 h-12 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center font-black">Login</Link>}<Link to="/add-listing" onClick={() => setMobileOpen(false)} className="col-span-2 h-12 rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white flex items-center justify-center font-black shadow-lg">Sell Item</Link></div></div></aside></div>
    </>
  );
}
function IconButton({ to, icon: Icon }) { return <NavLink to={to} className="hidden md:flex h-12 w-12 items-center justify-center rounded-full border border-pink-100 bg-white shadow-[0_12px_26px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:bg-pink-50 hover:shadow-xl transition"><Icon size={20} /></NavLink>; }
function Notice({ title, text }) { return <div className="rounded-2xl bg-pink-50/70 p-4"><h4 className="font-black text-sm">{title}</h4><p className="mt-1 text-sm text-slate-500">{text}</p></div>; }
