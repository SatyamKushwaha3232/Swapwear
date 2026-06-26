import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import Footer from "./Footer";
import CategorySlider from "./CategorySlider";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] overflow-x-hidden">
      <Navbar />

      <main className="relative">
        <Outlet />
      </main>

      <CategorySlider />
      <Footer />
    </div>
  );
}