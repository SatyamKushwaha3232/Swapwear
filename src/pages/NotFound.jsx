import { Link } from "react-router-dom";

import {
  ArrowLeft,
  Recycle,
} from "lucide-react";

/* =========================================
   404 Page
========================================= */

export default function NotFound() {
  return (
    <section className="min-h-[75vh] flex items-center justify-center px-6">

      <div className="max-w-2xl text-center">

        <div className="mx-auto w-24 h-24 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">

          <Recycle size={42} />

        </div>

        <h1 className="mt-8 text-8xl md:text-9xl font-black text-[var(--accent)] tracking-[-6px]">
          404
        </h1>

        <h2 className="mt-4 text-4xl md:text-5xl font-black tracking-[-2px]">
          Page not found
        </h2>

        <p className="mt-5 text-lg text-[var(--muted)] leading-relaxed">
          The page you are looking for doesn’t exist or has been moved.
          Let’s take you back to the SwapWear marketplace.
        </p>

        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 px-7 py-4 rounded-full bg-[var(--text)] text-white font-black hover:bg-[var(--accent)] transition shadow-xl"
        >
          <ArrowLeft size={19} />
          Back to Home
        </Link>

      </div>

    </section>
  );
}