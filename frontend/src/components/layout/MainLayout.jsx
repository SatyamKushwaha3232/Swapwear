import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
import CategorySlider from "./CategorySlider";

export default function MainLayout() {
  return (
    <div className="min-h-screen w-full overflow-x-clip bg-[var(--bg)] text-[var(--text)]">
      <Navbar />

      <main className="w-full pt-[96px] md:pt-[104px]">
        <Outlet />
      </main>

      <CategorySlider />
      <Footer />
    </div>
  );
}