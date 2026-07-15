import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Recycle, Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { loginWithBackend, signupWithBackend } from "../services/backendAuth";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const redirectTo = location.state?.from || "/dashboard";

  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleAuth(e) {
    e.preventDefault();
    if (!formData.email || !formData.password) return toast.error("Email and password are required");
    if (!isLogin && !formData.name.trim()) return toast.error("Full name is required");

    setLoading(true);
    try {
      if (isLogin) {
        await loginWithBackend(formData.email.trim(), formData.password);
        toast.success("Login successful");
        navigate(redirectTo, { replace: true });
        return;
      }

      await signupWithBackend({ fullName: formData.name.trim(), email: formData.email.trim(), password: formData.password });
      toast.success("Account created");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section-space pt-28">
      <div className="container-main">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[48px] border border-white/50 bg-white/60 shadow-[0_30px_100px_rgba(15,23,42,0.10)] backdrop-blur-2xl lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative flex min-h-[640px] flex-col justify-between overflow-hidden bg-pink-400/20 p-10 lg:p-12">
            <div className="absolute left-[-120px] top-[-120px] h-[340px] w-[340px] rounded-full bg-pink-400 opacity-30 blur-3xl" />
            <div className="absolute bottom-[-140px] right-[-120px] h-[380px] w-[380px] rounded-full bg-yellow-200 opacity-40 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-white shadow-xl"><Recycle size={26} /></span>
                <span className="text-4xl font-black">SwapWear</span>
              </div>
              <div className="mt-16 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/55 px-5 py-2 font-black backdrop-blur-xl"><Sparkles size={16} className="text-[var(--accent)]" /> Sustainable fashion community</div>
              <h1 className="mt-8 text-5xl font-black leading-[1.02] lg:text-6xl">Refresh your wardrobe without buying new.</h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--muted)]">Login to list clothing, send swap requests, negotiate in chat, and manage your sustainable fashion profile.</p>
            </div>
            <div className="relative grid grid-cols-2 gap-4">
              <Stat value="Manual" label="Backend auth" />
              <Stat value="Safe" label="PostgreSQL data" />
            </div>
          </div>
          <div className="bg-white/40 p-8 backdrop-blur-xl md:p-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-pink-400/20 px-5 py-2 font-black text-[var(--accent)] backdrop-blur-xl"><ShieldCheck size={17} /> Secure access</div>
            <h2 className="mt-7 text-5xl font-black leading-[1] md:text-6xl">{isLogin ? "Welcome back." : "Create account."}</h2>
            <p className="mt-5 text-lg leading-relaxed text-[var(--muted)]">Continue your clothing swap journey and manage marketplace activity.</p>
            <form onSubmit={handleAuth} className="mt-10 space-y-6">
              {!isLogin && <Field label="Full Name" icon={User}><input type="text" name="name" placeholder="Satyam Kushwaha" value={formData.name} onChange={handleChange} className="w-full bg-transparent px-3 outline-none" /></Field>}
              <Field label="Email" icon={Mail}><input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} className="w-full bg-transparent px-3 outline-none" /></Field>
              <Field label="Password" icon={Lock}><input type="password" name="password" placeholder="Enter password" value={formData.password} onChange={handleChange} className="w-full bg-transparent px-3 outline-none" /></Field>
              <button type="submit" disabled={loading} className="flex h-[68px] w-full items-center justify-center gap-3 rounded-full border border-white/50 bg-pink-400/35 text-lg font-black shadow-[0_14px_40px_rgba(255,105,180,0.22)] transition hover:bg-pink-400/50 disabled:opacity-60">{loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}<ArrowRight size={20} /></button>
            </form>
            <p className="mt-7 text-center font-semibold text-[var(--muted)]">{isLogin ? "New to SwapWear?" : "Already have an account?"}<button type="button" onClick={() => setIsLogin((prev) => !prev)} className="ml-2 font-black text-[var(--accent)]">{isLogin ? "Create account" : "Login"}</button></p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }) {
  return <div className="rounded-[30px] border border-white/50 bg-white/55 p-5 backdrop-blur-xl"><h3 className="text-4xl font-black">{value}</h3><p className="mt-2 font-semibold text-[var(--muted)]">{label}</p></div>;
}

function Field({ label, icon: Icon, children }) {
  return <div><label className="font-black">{label}</label><div className="mt-3 flex h-16 items-center rounded-[24px] border border-white/50 bg-white/55 px-5 backdrop-blur-xl"><Icon size={19} className="text-[var(--muted)]" />{children}</div></div>;
}
