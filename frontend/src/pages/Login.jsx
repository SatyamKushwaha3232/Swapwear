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
import { supabase } from "../lib/supabase";

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
    setForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!form.password.trim()) {
      toast.error("Password is required");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Welcome back");
    navigate("/dashboard");
  }

  async function handleOAuth(provider) {
    setOauthLoading(provider);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast.error(error.message);
      setOauthLoading("");
    }
  }

  return (
    <section className="section-space pt-32">
      <div className="container-main grid lg:grid-cols-[1fr_0.9fr] gap-10 items-center">
        <div className="relative overflow-hidden rounded-[46px] bg-white/60 backdrop-blur-2xl border border-white/50 p-10 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-pink-300/40 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-fuchsia-300/30 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-400/20 font-black text-pink-500">
              <Sparkles size={16} />
              Welcome Back
            </div>

            <h1 className="mt-6 text-6xl xl:text-7xl font-black tracking-[-3px] leading-[0.95]">
              Login to
              <br />
              SwapWear.
            </h1>

            <p className="mt-6 text-lg text-[var(--muted)] max-w-xl leading-relaxed">
              Continue your sustainable fashion journey, manage listings, send
              swap requests, save wishlist items and chat with real swappers.
            </p>

            <div className="mt-10 grid sm:grid-cols-3 gap-4">
              <MiniStat value="100%" label="Secure auth" />
              <MiniStat value="Live" label="Marketplace" />
              <MiniStat value="Eco" label="Fashion swaps" />
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[46px] bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_25px_80px_rgba(15,23,42,0.08)] p-8 md:p-10 space-y-6"
        >
          <div>
            <h2 className="text-4xl font-black tracking-[-1px]">
              Sign in
            </h2>
            <p className="mt-2 text-[var(--muted)] font-semibold">
              Enter your details to access your account.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">

             //button
          </div>

          <div className="relative flex items-center gap-4">
            <div className="h-px flex-1 bg-pink-100" />
            <span className="text-sm font-black text-[var(--muted)]">
              OR LOGIN WITH EMAIL
            </span>
            <div className="h-px flex-1 bg-pink-100" />
          </div>

          <Field icon={Mail} label="Email">
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="input-premium"
              placeholder="you@example.com"
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
              required
            />
          </Field>

          <div className="flex items-center justify-between gap-4 text-sm font-bold">
            <label className="inline-flex items-center gap-2 cursor-pointer">
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
            disabled={loading}
            className="w-full h-14 rounded-full bg-slate-950 !text-white font-black flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-pink-500 transition"
          >
            {loading ? "Logging in..." : "Login"}
            <ArrowRight size={18} />
          </button>

          <div className="rounded-[26px] bg-pink-50/70 border border-pink-100 p-4 flex items-start gap-3">
            <ShieldCheck className="text-pink-500 shrink-0" size={20} />
            <p className="text-sm text-slate-600 font-semibold leading-relaxed">
              Your session is protected by Supabase Auth. Social login requires
              provider setup in Supabase before it works.
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
      <label className="font-black flex items-center gap-2 mb-2">
        <Icon size={18} />
        {label}
      </label>
      {children}
    </div>
  );
}

function MiniStat({ value, label }) {
  return (
    <div className="rounded-[28px] bg-white/60 border border-white/50 p-5">
      <h3 className="text-3xl font-black text-pink-500">{value}</h3>
      <p className="mt-1 text-sm font-bold text-[var(--muted)]">{label}</p>
    </div>
  );
}
