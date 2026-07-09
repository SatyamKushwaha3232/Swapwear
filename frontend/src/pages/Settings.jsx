import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  return (
    <section className="section-space pt-28">
      <div className="container-main">
        <div className="premium-surface rounded-[38px] p-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-100 text-pink-500 shadow-sm">
            <SettingsIcon size={28} />
          </div>

          <h1 className="mt-6 text-5xl font-black tracking-[-2px]">
            Settings
          </h1>

          <p className="mt-4 text-[var(--muted)] text-lg">
            Account and privacy settings will appear here.
          </p>
        </div>
      </div>
    </section>
  );
}
