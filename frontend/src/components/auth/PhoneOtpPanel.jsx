import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowRight, Phone } from "lucide-react";

import { requestBackendPhoneOtp } from "../../services/backendAuth";

export default function PhoneOtpPanel({ mode = "login", onVerify }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function requestOtp() {
    if (!phone.trim()) return toast.error("Phone number is required");

    try {
      setLoading(true);
      const payload = await requestBackendPhoneOtp(phone);
      setSent(true);
      setDevOtp(payload.devOtp || "");
      toast.success("OTP sent");
    } catch (error) {
      toast.error(error.message || "Unable to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    if (!code.trim()) return toast.error("OTP is required");
    if (mode === "signup" && !fullName.trim()) return toast.error("Full name is required");

    await onVerify({
      phone,
      code,
      fullName: fullName.trim() || "Phone user",
    });
  }

  return (
    <div className="rounded-[26px] border border-pink-100 bg-pink-50/60 p-4">
      <div className="flex items-center gap-2 font-black text-slate-900">
        <Phone size={18} className="text-pink-500" />
        Phone OTP
      </div>

      {mode === "signup" && (
        <input
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="input-premium mt-4"
          placeholder="Full name"
          autoComplete="name"
        />
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className="input-premium"
          placeholder="+91 98765 43210"
          autoComplete="tel"
        />
        <button
          type="button"
          disabled={loading}
          onClick={requestOtp}
          className="rounded-full bg-white px-6 py-3 text-sm font-black text-pink-500 shadow-sm transition hover:bg-pink-100 disabled:opacity-60"
        >
          {sent ? "Resend" : "Send OTP"}
        </button>
      </div>

      {sent && (
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="input-premium"
            placeholder="6 digit OTP"
            inputMode="numeric"
          />
          <button
            type="button"
            disabled={loading}
            onClick={verifyOtp}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white transition hover:bg-pink-500 disabled:opacity-60"
          >
            Verify
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {devOtp && (
        <p className="mt-3 rounded-2xl bg-white/80 px-4 py-3 text-sm font-bold text-slate-600">
          Dev OTP: <span className="font-black text-pink-500">{devOtp}</span>
        </p>
      )}
    </div>
  );
}
