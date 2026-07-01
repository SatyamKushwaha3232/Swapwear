import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  User,
  MapPin,
  Calendar,
  Sparkles,
  Save,
  Camera,
} from "lucide-react";

import {
  getCurrentProfile,
  updateProfile,
  uploadAvatar,
} from "../services/profile";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    phone: "",
    city: "",
    location: "",
    website: "",
    bio: "",
    avatar_url: "",
  });

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      const response = await getCurrentProfile();

      if (response.success && response.data) {
        setProfile(response.data);
        setFormData({
          full_name: response.data.full_name || "",
          username: response.data.username || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          city: response.data.city || "",
          location: response.data.location || "",
          website: response.data.website || "",
          bio: response.data.bio || "",
          avatar_url: response.data.avatar_url || "",
        });
      } else if (response.error) {
        toast.error(response.error);
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  function handleChange(e) {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSave() {
    setSaving(true);

    const response = await updateProfile(formData);

    if (!response.success) {
      toast.error(response.error);
      setSaving(false);
      return;
    }

    const updated = response.data || { ...profile, ...formData };
    setProfile(updated);
    setFormData((prev) => ({ ...prev, ...updated }));
    toast.success("Profile updated");
    setSaving(false);
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const response = await uploadAvatar(file);

    if (!response.success) {
      toast.error(response.error);
      setUploading(false);
      return;
    }

    setProfile((prev) => ({ ...prev, avatar_url: response.avatar }));
    setFormData((prev) => ({ ...prev, avatar_url: response.avatar }));
    toast.success("Profile photo updated");
    setUploading(false);
  }

  if (loading) {
    return (
      <section className="section-space pt-28">
        <div className="container-main">
          <div className="h-[360px] rounded-[46px] bg-white/45 animate-pulse" />
        </div>
      </section>
    );
  }

  const avatarText = (formData.full_name || "U").charAt(0).toUpperCase();

  return (
    <section className="section-space pt-28">
      <div className="container-main">
        <div className="rounded-[46px] bg-white/60 backdrop-blur-2xl border border-white/50 shadow-[0_30px_100px_rgba(15,23,42,0.08)] p-8 md:p-12">
          <div className="flex flex-col lg:flex-row gap-10 lg:items-start">
            <div className="relative w-32 h-32 shrink-0">
              <div className="w-32 h-32 rounded-full bg-pink-400/25 border border-white/50 overflow-hidden flex items-center justify-center text-5xl font-black text-[var(--accent)]">
                {formData.avatar_url ? (
                  <img
                    src={formData.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  avatarText
                )}
              </div>

              <label className="absolute right-0 bottom-0 w-11 h-11 rounded-full bg-pink-400 text-white flex items-center justify-center shadow-xl cursor-pointer">
                <Camera size={20} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-400/20 border border-white/50 text-[var(--accent)] font-black">
                <Sparkles size={16} />
                Public Profile
              </div>

              <h1 className="mt-5 text-5xl md:text-7xl font-black tracking-[-3px]">
                {formData.full_name || "SwapWear User"}
              </h1>

              <p className="mt-4 text-xl text-[var(--muted)]">
                {formData.bio || "Sustainable fashion swapper."}
              </p>

              <div className="mt-7 flex flex-wrap gap-4">
                <InfoPill icon={User} label="Verified Swapper" />
                <InfoPill icon={MapPin} label={formData.city || "India"} />
                <InfoPill icon={Calendar} label="Joined recently" />
              </div>

              <div className="mt-10 grid lg:grid-cols-2 gap-6">
                <div>
                  <label className="font-black">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="mt-3 w-full h-16 px-6 rounded-[24px] bg-white/55 backdrop-blur-xl border border-white/50 outline-none focus:border-pink-300/50 transition font-bold"
                  />
                </div>

                <div>
                  <label className="font-black">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="satyamkushwaha"
                    className="mt-3 w-full h-16 px-6 rounded-[24px] bg-white/55 backdrop-blur-xl border border-white/50 outline-none focus:border-pink-300/50 transition font-bold"
                  />
                </div>

                <div>
                  <label className="font-black">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="mt-3 w-full h-16 px-6 rounded-[24px] bg-slate-100/70 backdrop-blur-xl border border-white/50 outline-none font-bold text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="font-black">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="mt-3 w-full h-16 px-6 rounded-[24px] bg-white/55 backdrop-blur-xl border border-white/50 outline-none focus:border-pink-300/50 transition font-bold"
                  />
                </div>

                <div>
                  <label className="font-black">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Jabalpur, India"
                    className="mt-3 w-full h-16 px-6 rounded-[24px] bg-white/55 backdrop-blur-xl border border-white/50 outline-none focus:border-pink-300/50 transition font-bold"
                  />
                </div>

                <div>
                  <label className="font-black">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com"
                    className="mt-3 w-full h-16 px-6 rounded-[24px] bg-white/55 backdrop-blur-xl border border-white/50 outline-none focus:border-pink-300/50 transition font-bold"
                  />
                </div>

                <div>
                  <label className="font-black">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Mumbai, Delhi, Jabalpur..."
                    className="mt-3 w-full h-16 px-6 rounded-[24px] bg-white/55 backdrop-blur-xl border border-white/50 outline-none focus:border-pink-300/50 transition font-bold"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="font-black">Bio</label>
                <textarea
                  name="bio"
                  rows="5"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell people about your fashion style, swap preferences, and location..."
                  className="mt-3 w-full p-6 rounded-[28px] bg-white/55 backdrop-blur-xl border border-white/50 outline-none focus:border-pink-300/50 transition resize-none font-semibold"
                />
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || uploading}
                className="mt-8 h-14 px-8 rounded-full bg-pink-400/35 backdrop-blur-xl border border-white/50 font-black flex items-center gap-3 hover:bg-pink-400/50 transition shadow-[0_12px_34px_rgba(255,105,180,0.20)] disabled:opacity-60"
              >
                <Save size={20} />
                {saving ? "Saving..." : uploading ? "Uploading..." : "Save Profile"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoPill({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/55 border border-white/50 font-black">
      <Icon size={18} />
      {label}
    </span>
  );
}
