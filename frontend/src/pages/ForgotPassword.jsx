import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Mail, Sparkles } from "lucide-react";
import { requestBackendPasswordReset } from "../services/backendAuth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email) {
      toast.error("Enter your email");
      return;
    }

    setLoading(true);
    setResetLink("");

    try {
      const data = await requestBackendPasswordReset(email);
      setResetLink(data?.reset_url || "");
      toast.success("Reset link generated");
    } catch (error) {
      toast.error(error.message || "Unable to create reset link");
    }

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

          {resetLink && (
            <div className="rounded-[28px] border border-pink-100 bg-pink-50/80 p-5">
              <p className="text-sm font-black text-pink-500">Development reset link</p>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                Mail provider add hone tak local testing ke liye ye link use karo.
              </p>
              <Link
                to={new URL(resetLink).pathname + new URL(resetLink).search}
                className="mt-4 inline-flex break-all rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-900 shadow-sm"
              >
                {resetLink}
              </Link>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
