import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function HomeCTA() {
  return (
    <section className="container-main py-16 md:py-20">
      <div className="premium-surface rounded-[38px] p-8 text-center md:p-14">
        <h2 className="mx-auto max-w-3xl text-4xl font-black leading-tight md:text-5xl">
          Ready to list your first item?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-semibold leading-relaxed text-slate-500">
          Upload your clothes, set swap points, and start exchanging with real users.
        </p>
        <Link to="/add-listing" className="button-primary mt-8 h-14 px-8">
          Start Listing <ArrowRight size={20} />
        </Link>
      </div>
    </section>
  );
}
