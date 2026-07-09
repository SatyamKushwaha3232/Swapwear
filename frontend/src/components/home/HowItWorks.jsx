const steps = [
  ["01", "Create Profile", "Sign up and complete your swapper profile."],
  ["02", "List Item", "Upload images, size, brand, condition, and points."],
  ["03", "Request Swap", "Choose an item and send a structured swap request."],
  ["04", "Chat & Finalize", "Discuss details and complete your exchange."],
];

export default function HowItWorks() {
  return (
    <section className="container-main py-16 md:py-20">
      <div className="relative overflow-hidden rounded-[38px] bg-slate-950 p-8 text-white shadow-[0_34px_100px_rgba(15,23,42,0.28)] md:p-14">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,79,163,0.18),transparent_36%),linear-gradient(300deg,rgba(139,92,246,0.18),transparent_42%)]" />

        <div className="relative">
          <p className="font-black text-pink-300">How It Works</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight md:text-5xl">
            Swap fashion in four simple steps.
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {steps.map(([num, title, text]) => (
              <div
                key={num}
                className="rounded-[26px] border border-white/10 bg-white/10 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/14"
              >
                <h3 className="text-4xl font-black text-pink-300">{num}</h3>
                <h4 className="mt-6 text-xl font-black">{title}</h4>
                <p className="mt-3 font-medium leading-relaxed text-white/64">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
