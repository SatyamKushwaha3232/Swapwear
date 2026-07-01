import { MessageCircle, ShieldCheck, Star, ThumbsUp } from "lucide-react";

const reviews = [
  {
    name: "Aakash",
    rating: 5,
    text: "Smooth swap experience. Item details were clear and communication was easy.",
  },
  {
    name: "Satyam",
    rating: 4.8,
    text: "Good quality listing and safe exchange process. Loved the sustainable idea.",
  },
];

export default function ReviewPanel() {
  return (
    <section className="section-space pt-0">
      <div className="container-main">
        <div className="grid gap-7 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[34px] border border-pink-100 bg-white/90 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.06)] md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-5 py-2 font-black text-pink-500">
              <Star size={17} fill="currentColor" />
              Trust Score
            </div>

            <h2 className="mt-5 text-4xl font-black tracking-[-2px]">
              4.8/5 rating
            </h2>

            <p className="mt-3 font-semibold leading-relaxed text-[var(--muted)]">
              Ratings help swappers understand listing quality, response
              behavior, and exchange trust.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <TrustItem icon={ShieldCheck} title="Verified" text="User identity checked" />
              <TrustItem icon={MessageCircle} title="Responsive" text="Quick chat replies" />
              <TrustItem icon={ThumbsUp} title="Reliable" text="Good swap history" />
            </div>
          </div>

          <div className="rounded-[34px] border border-pink-100 bg-white/90 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.06)] md:p-8">
            <h2 className="text-3xl font-black tracking-[-1px]">
              Recent Reviews
            </h2>

            <div className="mt-6 grid gap-4">
              {reviews.map((review) => (
                <div
                  key={review.name}
                  className="rounded-[26px] border border-pink-50 bg-pink-50/50 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 font-black text-white">
                        {review.name.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-black">{review.name}</h3>
                        <p className="truncate text-sm font-bold text-slate-500">
                          SwapWear member
                        </p>
                      </div>
                    </div>

                    <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-2 text-sm font-black text-slate-700">
                      <Star size={15} fill="currentColor" className="text-yellow-400" />
                      {review.rating}
                    </div>
                  </div>

                  <p className="mt-4 font-medium leading-relaxed text-slate-600">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustItem({ icon: Icon, title, text }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-[22px] bg-pink-50/70 p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-pink-500">
        <Icon size={20} />
      </div>

      <div className="min-w-0">
        <h3 className="truncate font-black">{title}</h3>
        <p className="truncate text-sm font-semibold text-slate-500">{text}</p>
      </div>
    </div>
  );
}