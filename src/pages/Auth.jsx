import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Recycle,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { getCurrentProfile } from "../services/profile";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const redirectTo = location.state?.from || "/dashboard";

  function handleChange(e) {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleAuth(e) {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Email and password are required");
      return;
    }

    if (!isLogin && !formData.name.trim()) {
      toast.error("Full name is required");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        await getCurrentProfile();
        toast.success("Login successful");
        navigate(redirectTo, { replace: true });
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.name.trim(),
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        await supabase.from("profiles").upsert(
          [
            {
              id: data.user.id,
              full_name: formData.name.trim(),
              city: "",
              bio: "",
              avatar_url: "",
            },
          ],
          { onConflict: "id" }
        );
      }

      toast.success("Account created. Please login now.");
      setIsLogin(true);
      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section-space pt-28">
      <div className="container-main">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] rounded-[48px] bg-white/60 backdrop-blur-2xl border border-white/50 shadow-[0_30px_100px_rgba(15,23,42,0.10)] overflow-hidden">
          <div className="relative overflow-hidden bg-pink-400/20 p-10 lg:p-12 min-h-[640px] flex flex-col justify-between">
            <div className="absolute top-[-120px] left-[-120px] w-[340px] h-[340px] rounded-full bg-pink-400 blur-3xl opacity-30" />
            <div className="absolute bottom-[-140px] right-[-120px] w-[380px] h-[380px] rounded-full bg-yellow-200 blur-3xl opacity-40" />

            <div className="relative">
              <div className="inline-flex items-center gap-3">
                <span className="w-14 h-14 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-xl">
                  <Recycle size={26} />
                </span>
                <span className="text-4xl font-black">SwapWear</span>
              </div>

              <div className="mt-16 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/55 backdrop-blur-xl border border-white/50 font-black">
                <Sparkles size={16} className="text-[var(--accent)]" />
                Sustainable fashion community
              </div>

              <h1 className="mt-8 text-5xl lg:text-6xl font-black leading-[1.02] tracking-[-3px]">
                Refresh your wardrobe without buying new.
              </h1>

              <p className="mt-6 text-[var(--muted)] text-lg leading-relaxed max-w-md">
                Login to list clothing, send swap requests, negotiate in chat,
                and manage your sustainable fashion profile.
              </p>
            </div>

            <div className="relative grid grid-cols-2 gap-4">
              <div className="rounded-[30px] bg-white/55 backdrop-blur-xl border border-white/50 p-5">
                <h3 className="text-4xl font-black">12K+</h3>
                <p className="mt-2 text-[var(--muted)] font-semibold">
                  Active swappers
                </p>
              </div>
              <div className="rounded-[30px] bg-white/55 backdrop-blur-xl border border-white/50 p-5">
                <h3 className="text-4xl font-black">8K+</h3>
                <p className="mt-2 text-[var(--muted)] font-semibold">
                  Swaps done
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12 bg-white/40 backdrop-blur-xl">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-400/20 backdrop-blur-xl border border-white/50 text-[var(--accent)] font-black">
              <ShieldCheck size={17} />
              Secure access
            </div>

            <h2 className="mt-7 text-5xl md:text-6xl font-black tracking-[-3px] leading-[1]">
              {isLogin ? "Welcome back." : "Create account."}
            </h2>

            <p className="mt-5 text-lg text-[var(--muted)] leading-relaxed">
              Continue your clothing swap journey and manage your marketplace
              activity.
            </p>

            <form onSubmit={handleAuth} className="mt-10 space-y-6">
              {!isLogin && (
                <Field label="Full Name" icon={User}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Satyam Kushwaha"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none px-3"
                  />
                </Field>
              )}

              <Field label="Email" icon={Mail}>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none px-3"
                />
              </Field>

              <Field label="Password" icon={Lock}>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none px-3"
                />
              </Field>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[68px] rounded-full bg-pink-400/35 backdrop-blur-xl border border-white/50 font-black text-lg hover:bg-pink-400/50 transition shadow-[0_14px_40px_rgba(255,105,180,0.22)] flex items-center justify-center gap-3 disabled:opacity-60"
              >
                {loading
                  ? "Please wait..."
                  : isLogin
                  ? "Login"
                  : "Create Account"}
                <ArrowRight size={20} />
              </button>
            </form>

            <p className="mt-7 text-center text-[var(--muted)] font-semibold">
              {isLogin ? "New to SwapWear?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setIsLogin((prev) => !prev)}
                className="text-[var(--accent)] font-black ml-2"
              >
                {isLogin ? "Create account" : "Login"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="font-black">{label}</label>
      <div className="mt-3 h-16 rounded-[24px] bg-white/55 backdrop-blur-xl border border-white/50 flex items-center px-5">
        <Icon size={19} className="text-[var(--muted)]" />
        {children}
      </div>
    </div>
  );
}
