import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Lock, User, Sparkles, ArrowRight } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
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

    toast.success("Account created. Check email if verification is enabled.");
    navigate("/dashboard");
  }

  return (
    <section className="section-space pt-32">
      <div className="container-main grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-400/20 font-black">
            <Sparkles size={16} />
            Join SwapWear
          </div>

          <h1 className="mt-6 text-6xl font-black tracking-[-3px]">
            Create your account.
          </h1>

          <p className="mt-5 text-lg text-[var(--muted)] max-w-xl">
            List items, send swap requests, chat with swappers, and track your wardrobe impact.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[42px] bg-white/60 backdrop-blur-2xl border border-white/50 shadow-[0_25px_80px_rgba(15,23,42,0.08)] p-8 space-y-6"
        >
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
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="input-premium"
              placeholder="Minimum 6 characters"
              required
            />
          </Field>

          <button
            disabled={loading}
            className="w-full h-14 rounded-full bg-slate-950 !text-white font-black flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Account"}
            <ArrowRight size={18} />
          </button>

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