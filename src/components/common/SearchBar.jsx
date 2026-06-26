import { Search, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

/* =========================================
   Premium Search Bar
========================================= */

export default function SearchBar({
  placeholder = "Search clothes, brands, styles...",
  buttonText = "Explore Now",
  to = "/explore",
}) {
  return (
    <div className="w-full max-w-2xl rounded-full bg-white border border-[var(--line)] shadow-[var(--shadow-medium)] p-3 flex items-center gap-3">

      {/* SEARCH ICON */}
      <div className="w-12 h-12 rounded-full bg-[var(--bg-soft)] flex items-center justify-center shrink-0">
        <Search
          size={21}
          className="text-[var(--muted)]"
        />
      </div>

      {/* INPUT */}
      <input
        type="text"
        placeholder={placeholder}
        className="flex-1 min-w-0 bg-transparent outline-none text-[16px] md:text-[18px] placeholder:text-[var(--light-text)]"
      />

      {/* BUTTON */}
      <Link
        to={to}
        className="hidden sm:flex items-center gap-2 px-6 py-4 rounded-full bg-[var(--accent)] text-white font-black hover:bg-[var(--accent-dark)] transition shrink-0"
      >
        {buttonText}
        <ArrowRight size={18} />
      </Link>

    </div>
  );
}