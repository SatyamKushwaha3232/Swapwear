import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export default function NetworkStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[1000] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-rose-100 bg-white/95 px-4 py-3 text-sm font-black text-slate-800 shadow-[0_20px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
        <WifiOff size={20} />
      </span>
      You are offline. Changes may not save until connection is back.
    </div>
  );
}
