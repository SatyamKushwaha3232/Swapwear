import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Bell,
  CheckCircle2,
  LogOut,
  Mail,
  MapPin,
  Moon,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { getCurrentProfile, updateProfile } from "../services/profile";

const defaultPreferences = {
  swapAlerts: true,
  chatAlerts: true,
  weeklyDigest: false,
  compactCards: false,
  darkPreview: false,
};

export default function Settings() {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    phone: "",
    city: "",
    location: "",
    website: "",
    bio: "",
  });
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);

      const savedPreferences = localStorage.getItem("swapwear_preferences");
      if (savedPreferences) {
        try {
          setPreferences({ ...defaultPreferences, ...JSON.parse(savedPreferences) });
        } catch {
          setPreferences(defaultPreferences);
        }
      }

      const response = await getCurrentProfile();
      if (response.success) {
        const nextProfile = response.data;
        setProfile(nextProfile);
        setForm({
          full_name: nextProfile.full_name || "",
          username: nextProfile.username || "",
          phone: nextProfile.phone || "",
          city: nextProfile.city || "",
          location: nextProfile.location || "",
          website: nextProfile.website || "",
          bio: nextProfile.bio || "",
        });
      } else {
        toast.error(response.error || "Unable to load settings");
      }

      setLoading(false);
    }

    loadSettings();
  }, []);

  const completion = useMemo(() => {
    const fields = ["full_name", "username", "city", "location", "bio"];
    const filled = fields.filter((field) => String(form[field] || "").trim()).length;
    return Math.round((filled / fields.length) * 100);
  }, [form]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updatePreference(key) {
    setPreferences((current) => {
      const next = { ...current, [key]: !current[key] };
      localStorage.setItem("swapwear_preferences", JSON.stringify(next));
      return next;
    });
  }

  async function handleSaveProfile() {
    setSaving(true);
    const response = await updateProfile(form);

    if (response.success) {
      setProfile(response.data);
      toast.success("Settings saved");
    } else {
      toast.error(response.error || "Unable to save settings");
    }

    setSaving(false);
  }

  async function handleSignOut() {
    const confirmed = window.confirm("Sign out from this device?");
    if (!confirmed) return;

    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Signed out");
  }

  return (
    <section className="section-space pt-28">
      <div className="container-main">
        <div className="relative overflow-hidden rounded-[42px] bg-slate-950 p-7 text-white shadow-[0_34px_100px_rgba(15,23,42,0.22)] md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_18%,rgba(255,79,163,0.34),transparent_34%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.18),transparent_28%)]" />
          <div className="relative grid gap-7 xl:grid-cols-[1fr_360px] xl:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-black text-pink-100 ring-1 ring-white/15">
                <SettingsIcon size={17} />
                Account Settings
              </div>

              <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[0.96] md:text-7xl">
                Tune your SwapWear experience.
              </h1>

              <p className="mt-5 max-w-2xl text-lg font-semibold leading-relaxed text-white/68">
                Manage profile details, privacy signals, notification preferences, and session safety from one clean control room.
              </p>
            </div>

            <div className="rounded-[30px] border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-white/55">
                Profile Strength
              </p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <p className="text-5xl font-black">{completion}%</p>
                <CheckCircle2 size={32} className="text-emerald-300" />
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-emerald-300"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 rounded-[34px] border border-white/60 bg-white/75 p-10 text-center font-black text-slate-500">
            Loading settings...
          </div>
        ) : (
          <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_390px]">
            <main className="space-y-8">
              <SettingsCard
                icon={UserRound}
                title="Profile"
                text="These details help other swappers trust and recognize you."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Full name" value={form.full_name} onChange={(value) => updateField("full_name", value)} />
                  <Field label="Username" value={form.username} onChange={(value) => updateField("username", value)} />
                  <Field label="Phone" value={form.phone} onChange={(value) => updateField("phone", value)} />
                  <Field label="City" value={form.city} onChange={(value) => updateField("city", value)} />
                  <Field label="Location" value={form.location} onChange={(value) => updateField("location", value)} className="md:col-span-2" />
                  <Field label="Website" value={form.website} onChange={(value) => updateField("website", value)} className="md:col-span-2" />
                </div>

                <label className="mt-4 block">
                  <span className="text-sm font-black text-slate-500">Bio</span>
                  <textarea
                    value={form.bio}
                    onChange={(event) => updateField("bio", event.target.value)}
                    placeholder="Tell people about your style, swap preferences, or pickup comfort zone."
                    className="mt-2 min-h-32 w-full resize-none rounded-[24px] border border-pink-100 bg-white/75 p-4 font-semibold outline-none transition focus:border-pink-300"
                  />
                </label>

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveProfile}
                  className="button-primary mt-5 h-13 px-7 disabled:opacity-60"
                >
                  <Save size={18} />
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </SettingsCard>

              <SettingsCard
                icon={Bell}
                title="Notifications"
                text="Control the alerts that matter while swapping."
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <Toggle label="Swap status alerts" description="Accepted, shipped, completed, disputed." checked={preferences.swapAlerts} onChange={() => updatePreference("swapAlerts")} />
                  <Toggle label="Chat alerts" description="New messages and deal room updates." checked={preferences.chatAlerts} onChange={() => updatePreference("chatAlerts")} />
                  <Toggle label="Weekly digest" description="A light summary of saved items and activity." checked={preferences.weeklyDigest} onChange={() => updatePreference("weeklyDigest")} />
                  <Toggle label="Compact cards" description="Denser product cards on dashboard surfaces." checked={preferences.compactCards} onChange={() => updatePreference("compactCards")} />
                </div>
              </SettingsCard>
            </main>

            <aside className="space-y-8">
              <SettingsCard
                icon={ShieldCheck}
                title="Security"
                text="Your account is protected by Supabase Auth."
              >
                <div className="space-y-4">
                  <InfoRow icon={Mail} label="Email" value={user?.email || profile?.email || "Not available"} />
                  <InfoRow icon={MapPin} label="Provider" value={profile?.provider || user?.app_metadata?.provider || "email"} />
                  <Toggle label="Dark preview" description="Saved locally for future theme upgrade." checked={preferences.darkPreview} onChange={() => updatePreference("darkPreview")} icon={Moon} />
                </div>
              </SettingsCard>

              <SettingsCard
                icon={Sparkles}
                title="Premium"
                text="Boosted listing controls will appear here when payments are enabled."
              >
                <div className="rounded-[26px] bg-gradient-to-br from-pink-50 to-violet-50 p-5">
                  <p className="font-black text-slate-900">
                    {profile?.is_premium ? "Premium active" : "Premium not active"}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">
                    Premium state is ready in profile data. Payment gateway can unlock this later.
                  </p>
                </div>
              </SettingsCard>

              <SettingsCard
                icon={LogOut}
                title="Session"
                text="Leave this device safely."
              >
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-red-50 font-black text-red-600 transition hover:bg-red-100"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </SettingsCard>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

function SettingsCard({ icon: Icon, title, text, children }) {
  return (
    <section className="rounded-[34px] border border-white/60 bg-white/75 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl md:p-7">
      <div className="flex items-start gap-4">
        <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[20px] bg-pink-50 text-pink-500">
          <Icon size={23} />
        </div>
        <div>
          <h2 className="text-2xl font-black">{title}</h2>
          <p className="mt-1 font-semibold leading-relaxed text-slate-500">{text}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange, className = "" }) {
  return (
    <label className={className}>
      <span className="text-sm font-black text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-13 w-full rounded-full border border-pink-100 bg-white/75 px-5 font-semibold outline-none transition focus:border-pink-300"
      />
    </label>
  );
}

function Toggle({ label, description, checked, onChange, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center justify-between gap-4 rounded-[24px] border border-pink-50 bg-white/70 p-4 text-left transition hover:bg-pink-50/50"
    >
      <span className="flex min-w-0 items-start gap-3">
        {Icon && <Icon size={20} className="mt-1 shrink-0 text-pink-500" />}
        <span className="min-w-0">
          <span className="block font-black">{label}</span>
          <span className="mt-1 block text-sm font-semibold leading-relaxed text-slate-500">
            {description}
          </span>
        </span>
      </span>
      <span
        className={`relative h-8 w-14 shrink-0 rounded-full transition ${
          checked ? "bg-pink-500" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
            checked ? "left-7" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-[22px] bg-white/70 p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-pink-500">
        <Icon size={19} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
        <p className="truncate font-black">{value}</p>
      </div>
    </div>
  );
}
