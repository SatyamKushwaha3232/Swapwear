import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
import CategorySlider from "./CategorySlider";

export default function MainLayout() {
  return (
    <div className="relative min-h-screen w-full overflow-x-clip bg-[var(--bg)] text-[var(--text)]">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-80 [background-image:linear-gradient(to_right,rgba(255,79,163,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.055)_1px,transparent_1px)] [background-size:72px_72px]" />
      <Navbar />

      <main className="w-full pt-[96px] md:pt-[104px]">
        <Outlet />
      </main>

      <CategorySlider />
      <Footer />
    </div>
  );
}
