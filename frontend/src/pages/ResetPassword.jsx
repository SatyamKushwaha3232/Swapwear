import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { resetBackendPassword } from "../services/backendAuth";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token") || "";

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  const rules = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[^A-Za-z0-9]/.test(form.password),
  };

  const score = Object.values(rules).filter(Boolean).length;

  async function handleSubmit(e) {
    e.preventDefault();

    if (score < 5) {
      toast.error("Password is too weak");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!resetToken) {
      toast.error("Reset link is missing or invalid");
      return;
    }

    setLoading(true);

    try {
      await resetBackendPassword({ token: resetToken, password: form.password });
      toast.success("Password updated. Please login again.");
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Unable to reset password");
    }

    setLoading(false);
  }

  return (
    <section className="mx-auto grid max-w-[1120px] gap-10 lg:grid-cols-[0.9fr_1fr]">
      <div className="rounded-[46px] border border-white/50 bg-white/60 p-10 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-pink-400/20 px-5 py-2 font-black text-pink-500">
          <ShieldCheck size={16} />
          Secure Reset
        </div>

        <h1 className="mt-6 text-6xl font-black leading-[0.95] tracking-[-3px]">
          Create a new password.
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-[var(--muted)]">
          Choose a strong password for your SwapWear account. After updating,
          you can login again safely.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-[46px] border border-white/60 bg-white/70 p-8 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl md:p-10 space-y-6"
      >
        <div>
          <h2 className="text-4xl font-black tracking-[-1px]">
            Reset password
          </h2>
          <p className="mt-2 font-semibold text-[var(--muted)]">
            Enter and confirm your new password.
          </p>
          {!resetToken && (
            <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-600">
              Reset token missing. Start again from forgot password.
            </p>
          )}
        </div>

        <Field icon={Lock} label="New Password">
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

          <PasswordStrength score={score} rules={rules} />
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

        <button
          disabled={loading}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-slate-950 font-black !text-white transition hover:bg-pink-500 disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update Password"}
          <ArrowRight size={18} />
        </button>
      </form>
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
