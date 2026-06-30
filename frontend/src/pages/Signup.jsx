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

  const passwordScore =
    Object.values(passwordRules).filter(Boolean).length;

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.fullName.trim()) {
      return toast.error("Full name is required");
    }

    if (!form.email.trim()) {
      return toast.error("Email is required");
    }

    if (passwordScore < 5) {
      return toast.error("Password is too weak");
    }

    if (form.password !== form.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (!form.terms) {
      return toast.error("Accept Terms & Conditions");
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          full_name: form.fullName,
        },
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(
      "Account created. Please verify your email before login."
    );

    navigate("/login");
  }

  async function handleOAuth(provider) {
    setOauthLoading(provider);

    const { error } =
      await supabase.auth.signInWithOAuth({
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
    <section className="pt-10 lg:pt-14">
      <div className="mx-auto grid max-w-[1450px] lg:grid-cols-[1fr_0.95fr] gap-6 xl:gap-8 items-center">
        <div className="relative overflow-hidden rounded-[46px] bg-white/60 backdrop-blur-2xl border border-white/50 p-10 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-pink-300/40 blur-3xl" />
          <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-fuchsia-300/30 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-400/20 font-black text-pink-500">
              <Sparkles size={16} />
              Join SwapWear
            </div>

            <h1 className="mt-6 text-[66px] xl:text-[78px] font-black tracking-[-3px] leading-[0.95]">
              Create your
              <br />
              swap account.
            </h1>

            <p className="mt-6 text-lg text-[var(--muted)] max-w-xl leading-relaxed">
              Start listing fashion items, send swap requests, save wishlist
              products, and build your sustainable wardrobe.
            </p>

            <div className="mt-10 grid sm:grid-cols-3 gap-4">
              <MiniStat value="Safe" label="Verified auth" />
              <MiniStat value="Eco" label="Fashion reuse" />
              <MiniStat value="Live" label="Swap network" />
            </div>
          </div>
        </div>
                <form
          onSubmit={handleSubmit}
          className="rounded-[46px] bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_25px_80px_rgba(15,23,42,0.08)] p-8 md:p-10 space-y-6"
        >
          <div>
            <h2 className="text-4xl font-black tracking-[-1px]">
              Sign up
            </h2>
            <p className="mt-2 text-[var(--muted)] font-semibold">
              Create your secure SwapWear account.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
<AuthButtons
  oauthLoading={oauthLoading}
  onOAuth={handleOAuth}
/>
          </div>

          <div className="relative flex items-center gap-4">
            <div className="h-px flex-1 bg-pink-100" />
            <span className="text-sm font-black text-[var(--muted)]">
              OR CREATE WITH EMAIL
            </span>
            <div className="h-px flex-1 bg-pink-100" />
          </div>

          <Field icon={User} label="Full Name">
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="input-premium"
              placeholder="Satyam Kushwaha"
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
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
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
                required
              />

              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </Field>

          <label className="flex items-start gap-3 rounded-[24px] bg-pink-50/70 border border-pink-100 p-4 cursor-pointer">
            <input
              type="checkbox"
              name="terms"
              checked={form.terms}
              onChange={handleChange}
              className="mt-1 accent-pink-500"
            />

            <span className="text-sm font-semibold text-slate-600 leading-relaxed">
              I agree to SwapWear&apos;s{" "}
              <Link to="/terms" className="text-pink-500 font-black">
                Terms
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-pink-500 font-black">
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          <button
            disabled={loading}
            className="w-full h-14 rounded-full bg-slate-950 !text-white font-black flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-pink-500 transition"
          >
            {loading ? "Creating..." : "Create Account"}
            <ArrowRight size={18} />
          </button>

          <div className="rounded-[26px] bg-pink-50/70 border border-pink-100 p-4 flex items-start gap-3">
            <ShieldCheck className="text-pink-500 shrink-0" size={20} />
            <p className="text-sm text-slate-600 font-semibold leading-relaxed">
              After signup, verify your email if confirmations are enabled in Supabase.
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
      <label className="font-black flex items-center gap-2 mb-2">
        <Icon size={18} />
        {label}
      </label>
      {children}
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

  const strength =
    score <= 2 ? "Weak" : score <= 4 ? "Medium" : "Strong";

  return (
    <div className="mt-4 rounded-[24px] bg-white/60 border border-pink-100 p-4">
      <div className="flex items-center justify-between">
        <p className="font-black text-sm">Password strength</p>
        <p className="font-black text-sm text-pink-500">{strength}</p>
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

      <div className="mt-4 grid sm:grid-cols-2 gap-2">
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
    <div className="rounded-[28px] bg-white/60 border border-white/50 p-5">
      <h3 className="text-3xl font-black text-pink-500">{value}</h3>
      <p className="mt-1 text-sm font-bold text-[var(--muted)]">{label}</p>
    </div>
  );
}

function AuthButtons({ oauthLoading, onOAuth }) {
  const providers = [
    { id: "google", title: "Continue with Google", icon: GoogleIcon },
    { id: "azure", title: "Continue with Microsoft", icon: MicrosoftIcon },
    { id: "github", title: "Continue with GitHub", icon: GithubIcon },
  ];

  return (
    <div className="space-y-5">
      <div className="flex justify-center gap-5">
        {providers.map((provider) => (
          <button
            key={provider.id}
            type="button"
            title={provider.title}
            disabled={Boolean(oauthLoading)}
            onClick={() => onOAuth(provider.id)}
            className="group flex h-14 w-14 items-center justify-center rounded-2xl border border-pink-100 bg-white/80 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-pink-300 hover:shadow-[0_18px_40px_rgba(255,79,163,0.22)] disabled:opacity-60"
          >
            <img
              src={provider.icon}
              alt={provider.title}
              className="h-7 w-7 transition group-hover:scale-110"
            />
          </button>
        ))}

        <button
          type="button"
          disabled
          title="Phone OTP coming soon"
          className="flex h-14 w-14 cursor-not-allowed items-center justify-center rounded-2xl border border-pink-100 bg-pink-50 opacity-60"
        >
          <img src={PhoneIcon} alt="Phone OTP" className="h-7 w-7" />
        </button>
      </div>

      <p className="text-center text-xs font-semibold text-slate-400">
        Google, Microsoft & GitHub login available.
        <br />
        Phone OTP login coming soon.
      </p>
    </div>
  );
}

async function loginWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "http://localhost:5173/dashboard",
    },
  });

  if (error) {
    toast.error(error.message);
  }
}