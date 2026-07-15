import { useState } from "react";
import toast from "react-hot-toast";
import { Mail, Sparkles } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
    e.preventDefault();

    if (!email) {
        toast.error("Enter your email");
        return;
    }

    setLoading(true);
    toast("Password reset email will be available after backend mail setup.");
    setLoading(false);
    }

  return (
    <section className="section-space pt-32">
      <div className="container-main max-w-2xl">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-400/20 font-black">
          <Sparkles size={16} />
          Reset Password
        </div>

        <h1 className="mt-6 text-6xl font-black tracking-[-3px]">
          Forgot password?
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-[42px] bg-white/60 backdrop-blur-2xl border border-white/50 shadow-[0_25px_80px_rgba(15,23,42,0.08)] p-8 space-y-6"
        >
          <label className="font-black flex items-center gap-2">
            <Mail size={18} />
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-premium"
            placeholder="you@example.com"
            required
          />

          <button
            disabled={loading}
            className="w-full h-14 rounded-full bg-slate-950 !text-white font-black disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </section>
  );
}
