import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import GoogleIcon from "../assets/auth-icons/google.svg";
import MicrosoftIcon from "../assets/auth-icons/microsoft.svg";
import GithubIcon from "../assets/auth-icons/github.svg";
import PhoneIcon from "../assets/auth-icons/phone.svg";
import { supabase } from "../lib/supabase";

export default function Signup() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  const passwordRules = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[^A-Za-z0-9]/.test(form.password),
  };

  const passwordScore = Object.values(passwordRules).filter(Boolean).length;

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.fullName.trim()) return toast.error("Full name is required");
    if (!form.email.trim()) return toast.error("Email is required");
    if (passwordScore < 5) return toast.error("Password is too weak");
    if (form.password !== form.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (!form.terms) return toast.error("Accept Terms & Conditions");

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: form.fullName.trim(),
            name: form.fullName.trim(),
          },
        },
      });

      if (error) throw error;

      if (data?.session) {
        toast.success("Account created");
        navigate("/dashboard", { replace: true });
        return;
      }

      toast.success("Account created. Please verify your email before login.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider) {
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
      toast.error(error.message || "Social signup failed");
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
              Join SwapWear
            </div>

            <h1 className="mt-6 text-[clamp(44px,6vw,74px)] font-black leading-[0.95] tracking-[-3px]">
              Create your
              <br />
              swap account.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
              Start listing fashion items, send swap requests, save wishlist
              products, and build your sustainable wardrobe.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <MiniStat value="Safe" label="Verified auth" />
              <MiniStat value="Eco" label="Fashion reuse" />
              <MiniStat value="Live" label="Swap network" />
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-[38px] border border-white/60 bg-white/70 p-7 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl md:p-9"
        >
          <div>
            <h2 className="text-4xl font-black tracking-[-1px]">Sign up</h2>
            <p className="mt-2 font-semibold text-[var(--muted)]">
              Create your secure SwapWear account.
            </p>
          </div>

          <AuthButtons oauthLoading={oauthLoading} onOAuth={handleOAuth} />

          <Divider text="OR CREATE WITH EMAIL" />

          <Field icon={User} label="Full Name">
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="input-premium"
              placeholder="Your full name"
              autoComplete="name"
              required
            />
          </Field>

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
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                className="input-premium pr-14"
                placeholder="Strong password"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <PasswordStrength score={passwordScore} rules={passwordRules} />
          </Field>

          <Field icon={Lock} label="Confirm Password">
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                className="input-premium pr-14"
                placeholder="Confirm password"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </Field>

          <label className="flex cursor-pointer items-start gap-3 rounded-[24px] border border-pink-100 bg-pink-50/70 p-4">
            <input
              type="checkbox"
              name="terms"
              checked={form.terms}
              onChange={handleChange}
              className="mt-1 accent-pink-500"
            />

            <span className="text-sm font-semibold leading-relaxed text-slate-600">
              I agree to SwapWear&apos;s{" "}
              <Link to="/terms" className="font-black text-pink-500">
                Terms
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="font-black text-pink-500">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          <button
            type="submit"
            disabled={loading || Boolean(oauthLoading)}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-slate-950 font-black !text-white transition hover:bg-pink-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Account"}
            <ArrowRight size={18} />
          </button>

          <div className="flex items-start gap-3 rounded-[24px] border border-pink-100 bg-pink-50/70 p-4">
            <ShieldCheck className="shrink-0 text-pink-500" size={20} />
            <p className="text-sm font-semibold leading-relaxed text-slate-600">
              After signup, verify your email if confirmations are enabled in
              Supabase.
            </p>
          </div>

          <p className="text-center font-bold text-[var(--muted)]">
            Already have an account?{" "}
            <Link to="/login" className="text-pink-500">
              Login
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

function PasswordStrength({ score, rules }) {
  const labels = [
    ["length", "8+ characters"],
    ["upper", "Uppercase"],
    ["lower", "Lowercase"],
    ["number", "Number"],
    ["special", "Special char"],
  ];

  const strength = score <= 2 ? "Weak" : score <= 4 ? "Medium" : "Strong";

  return (
    <div className="mt-4 rounded-[24px] border border-pink-100 bg-white/60 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-black">Password strength</p>
        <p className="text-sm font-black text-pink-500">{strength}</p>
      </div>

      <div className="mt-3 grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((bar) => (
          <div
            key={bar}
            className={`h-2 rounded-full ${
              score >= bar ? "bg-pink-500" : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {labels.map(([key, label]) => {
          const ok = rules[key];

          return (
            <div
              key={key}
              className="flex items-center gap-2 text-sm font-bold text-slate-600"
            >
              {ok ? (
                <CheckCircle2 size={16} className="text-emerald-500" />
              ) : (
                <XCircle size={16} className="text-slate-300" />
              )}
              {label}
            </div>
          );
        })}
      </div>
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