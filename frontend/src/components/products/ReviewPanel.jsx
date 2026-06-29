import { Star } from "lucide-react";

const reviews = [
  { name: "Aarav", text: "Clean listing, clear photos and fast response.", rating: 5 },
  { name: "Riya", text: "The item condition matched the description.", rating: 5 },
  { name: "Kabir", text: "Smooth swap experience and friendly owner.", rating: 4 },
];

export default function ReviewPanel() {
  return (
    <section className="container-main py-16">
      <div className="rounded-[44px] border border-pink-100 bg-white p-8 shadow-[0_30px_90px_rgba(15,23,42,0.07)] md:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-black text-pink-500">Reviews</p>
            <h2 className="mt-3 text-5xl font-black tracking-[-2px]">Community trust score.</h2>
          </div>
          <div className="rounded-full bg-yellow-50 px-5 py-3 font-black text-yellow-600">4.8 / 5.0</div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {reviews.map((review) => (
            <div key={review.name} className="rounded-[30px] bg-pink-50/50 p-6">
              <div className="flex gap-1 text-yellow-400">{Array.from({ length: review.rating }).map((_, i) => <Star key={i} size={18} fill="currentColor" />)}</div>
              <p className="mt-5 font-semibold leading-relaxed text-slate-600">“{review.text}”</p>
              <h4 className="mt-5 font-black">{review.name}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
