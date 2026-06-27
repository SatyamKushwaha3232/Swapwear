import { Link } from "react-router-dom";
import { User, LayoutDashboard, PlusCircle, MessageCircle, Repeat2, LogOut, Heart, Settings } from "lucide-react";
export default function UserMenu({ user, profile, open, onLogout }) {
  if (!open) return null;
  const displayName = profile?.full_name || user?.user_metadata?.full_name || "SwapWear User";
  return (
    <div className="absolute right-0 top-[72px] w-[330px] rounded-[34px] border border-white/70 bg-white/95 backdrop-blur-2xl shadow-[0_32px_90px_rgba(255,79,163,0.22)] overflow-hidden z-[1000]">
      <div className="p-5 border-b border-pink-50 bg-gradient-to-br from-pink-50 to-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white flex items-center justify-center text-2xl font-black shadow-lg ring-4 ring-white">
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" /> : displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-lg truncate">{displayName}</h3>
            <p className="text-sm text-slate-500 truncate">{user?.email}</p>
            <p className="mt-1 text-xs font-black text-pink-500">Verified Swapper</p>
          </div>
        </div>
      </div>
      <div className="p-3 space-y-1">
        <MenuLink to="/profile" icon={User} label="My Profile" />
        <MenuLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <MenuLink to="/add-listing" icon={PlusCircle} label="Add Listing" />
        <MenuLink to="/wishlist" icon={Heart} label="Wishlist" />
        <MenuLink to="/swaps" icon={Repeat2} label="Swap Requests" />
        <MenuLink to="/chat" icon={MessageCircle} label="Messages" />
        <MenuLink to="/settings" icon={Settings} label="Settings" />
      </div>
      <div className="p-3 border-t border-pink-50"><button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition font-black"><LogOut size={19} />Logout</button></div>
    </div>
  );
}
function MenuLink({ to, icon: Icon, label }) {
  return <Link to={to} className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-pink-50 hover:text-pink-500 transition font-black"><Icon size={19} />{label}</Link>;
}
