import {
  ArrowRight,
  Check,
  X,
  Clock,
  MessageCircle,
} from "lucide-react";

/* =========================================
   Premium Swap Request Card
========================================= */

export default function SwapCard({ request }) {
  return (
    <article className="bg-white rounded-[42px] border border-[var(--line)] shadow-[var(--shadow-soft)] p-6 md:p-7">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

        <div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--yellow-soft)] text-[#9a6b00] font-black text-sm">

            <Clock size={16} />

            {request.status}

          </div>

          <h3 className="mt-4 text-3xl font-black">
            {request.from}
          </h3>

          <p className="mt-1 text-[var(--muted)] font-semibold">
            {request.location}
          </p>

        </div>

        <button className="h-12 px-5 rounded-full bg-[var(--bg-soft)] font-black flex items-center gap-2 hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] transition">

          <MessageCircle size={18} />

          Message

        </button>

      </div>

      {/* COMPARISON */}
      <div className="mt-7 grid lg:grid-cols-[1fr_auto_1fr] gap-5 items-center">

        {/* WANTS */}
        <div className="rounded-[32px] bg-[var(--bg)] border border-[var(--line)] p-5">

          <p className="text-sm text-[var(--muted)] font-black">
            Wants your item
          </p>

          <div className="mt-4 flex items-center gap-4">

            <img
              src={request.wantImage}
              alt={request.wants}
              className="w-20 h-20 rounded-[22px] object-cover"
            />

            <div>

              <h4 className="text-xl font-black">
                {request.wants}
              </h4>

              <p className="mt-1 text-[var(--accent)] font-black">
                {request.wantPts} pts
              </p>

            </div>

          </div>

        </div>

        {/* ARROW */}
        <div className="w-14 h-14 rounded-full bg-white border border-[var(--line)] shadow-[var(--shadow-soft)] flex items-center justify-center mx-auto">

          <ArrowRight
            size={22}
            className="text-[var(--accent)]"
          />

        </div>

        {/* OFFERS */}
        <div className="rounded-[32px] bg-[var(--bg)] border border-[var(--line)] p-5">

          <p className="text-sm text-[var(--muted)] font-black">
            Offers item
          </p>

          <div className="mt-4 flex items-center gap-4">

            <img
              src={request.offerImage}
              alt={request.offers}
              className="w-20 h-20 rounded-[22px] object-cover"
            />

            <div>

              <h4 className="text-xl font-black">
                {request.offers}
              </h4>

              <p className="mt-1 text-[var(--accent)] font-black">
                {request.offerPts} pts
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* ACTIONS */}
      <div className="mt-7 flex flex-col sm:flex-row gap-4">

        <button className="flex-1 h-14 rounded-full bg-[var(--text)] text-white font-black flex items-center justify-center gap-2 hover:bg-[var(--green)] transition">

          <Check size={19} />

          Accept Swap

        </button>

        <button className="flex-1 h-14 rounded-full bg-[var(--red-soft)] text-[var(--red)] font-black flex items-center justify-center gap-2 hover:bg-[var(--red)] hover:text-white transition">

          <X size={19} />

          Decline

        </button>

      </div>

    </article>
  );
}
