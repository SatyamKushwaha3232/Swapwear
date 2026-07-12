import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import GoogleIcon from "../assets/auth-icons/google.svg";
import MicrosoftIcon from "../assets/auth-icons/microsoft.svg";
import GithubIcon from "../assets/auth-icons/github.svg";
import PhoneIcon from "../assets/auth-icons/phone.svg";
import { supabase } from "../lib/supabase";
import { backendAuthEnabled } from "../lib/backendApi";
import { loginWithBackend } from "../services/backendAuth";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: true,
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.email.trim()) return toast.error("Email is required");
    if (!form.password.trim()) return toast.error("Password is required");

    try {
      setLoading(true);

      if (backendAuthEnabled) {
        await loginWithBackend(form.email.trim(), form.password);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });

        if (error) throw error;
      }

      toast.success("Welcome back");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider) {
    if (backendAuthEnabled) {
      toast("Social login will be added after manual auth is live.");
      return;
    }

    try {
      setOauthLoading(provider);

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          scopes: provider === "azure" ? "openid email profile" : undefined,
        },
      });

      if (error) throw error;
    } catch (error) {
      toast.error(error.message || "Social login failed");
      setOauthLoading("");
    }
  }

  return (
    <section className="pt-8 lg:pt-12">
      <div className="mx-auto grid max-w-[1320px] items-center gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="relative overflow-hidden rounded-[38px] border border-white/60 bg-white/60 p-8 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl md:p-10">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-pink-300/40 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-fuchsia-300/30 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-pink-400/20 px-5 py-2 font-black text-pink-500">
              <Sparkles size={16} />
              Welcome Back
            </div>

            <h1 className="mt-6 text-[clamp(44px,6vw,74px)] font-black leading-[0.95] tracking-[-3px]">
              Login to
              <br />
              SwapWear.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
              Continue your sustainable fashion journey, manage listings, send
              swap requests, save wishlist items and chat with real swappers.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <MiniStat value="100%" label="Secure auth" />
              <MiniStat value="Live" label="Marketplace" />
              <MiniStat value="Eco" label="Fashion swaps" />
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-[38px] border border-white/60 bg-white/70 p-7 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl md:p-9"
        >
          <div>
            <h2 className="text-4xl font-black tracking-[-1px]">Sign in</h2>
            <p className="mt-2 font-semibold text-[var(--muted)]">
              Enter your details to access your account.
            </p>
          </div>

          <AuthButtons oauthLoading={oauthLoading} onOAuth={handleOAuth} />

          <Divider text="OR LOGIN WITH EMAIL" />

          <Field icon={Mail} label="Email">
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="input-premium"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </Field>

          <Field icon={Lock} label="Password">
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="input-premium"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </Field>

          <div className="flex items-center justify-between gap-4 text-sm font-bold">
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                className="accent-pink-500"
              />
              Remember me
            </label>

            <Link to="/forgot-password" className="text-pink-500">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading || Boolean(oauthLoading)}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-slate-950 font-black !text-white transition hover:bg-pink-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
            <ArrowRight size={18} />
          </button>

          <div className="flex items-start gap-3 rounded-[24px] border border-pink-100 bg-pink-50/70 p-4">
            <ShieldCheck className="shrink-0 text-pink-500" size={20} />
            <p className="text-sm font-semibold leading-relaxed text-slate-600">
              Email, Google, Microsoft and GitHub login are supported. Social
              providers must be enabled in Supabase.
            </p>
          </div>

          <p className="text-center font-bold text-[var(--muted)]">
            New to SwapWear?{" "}
            <Link to="/signup" className="text-pink-500">
              Create account
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}

function Field({ icon: Icon, label, children }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 font-black">
        <Icon size={18} />
        {label}
      </label>
      {children}
    </div>
  );
}

function Divider({ text }) {
  return (
    <div className="relative flex items-center gap-4">
      <div className="h-px flex-1 bg-pink-100" />
      <span className="text-xs font-black text-[var(--muted)] sm:text-sm">
        {text}
      </span>
      <div className="h-px flex-1 bg-pink-100" />
    </div>
  );
}

function MiniStat({ value, label }) {
  return (
    <div className="rounded-[24px] border border-white/60 bg-white/60 p-5">
      <h3 className="text-3xl font-black text-pink-500">{value}</h3>
      <p className="mt-1 text-sm font-bold text-[var(--muted)]">{label}</p>
    </div>
  );
}

function AuthButtons({ oauthLoading, onOAuth }) {
  const providers = [
    { id: "google", title: "Google", icon: GoogleIcon },
    { id: "azure", title: "Microsoft", icon: MicrosoftIcon },
    { id: "github", title: "GitHub", icon: GithubIcon },
  ];

  return (
    <div>
      <div className="grid grid-cols-4 gap-3">
        {providers.map((provider) => (
          <button
            key={provider.id}
            type="button"
            title={`Continue with ${provider.title}`}
            disabled={Boolean(oauthLoading)}
            onClick={() => onOAuth(provider.id)}
            className="flex h-14 items-center justify-center rounded-2xl border border-pink-100 bg-white/85 shadow-[0_10px_25px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:border-pink-300 disabled:opacity-60"
          >
            <img src={provider.icon} alt={provider.title} className="h-7 w-7" />
          </button>
        ))}

        <button
          type="button"
          disabled
          title="Phone OTP coming soon"
          className="flex h-14 cursor-not-allowed items-center justify-center rounded-2xl border border-pink-100 bg-pink-50 opacity-60"
        >
          <img src={PhoneIcon} alt="Phone OTP" className="h-7 w-7" />
        </button>
      </div>

      {oauthLoading && (
        <p className="mt-3 text-center text-sm font-black text-pink-500">
          Redirecting to {oauthLoading}...
        </p>
      )}
    </div>
  );
}
