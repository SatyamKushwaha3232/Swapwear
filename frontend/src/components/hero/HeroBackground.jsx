/* =========================================
   Hero Background
   Premium cinematic pastel effects
========================================= */

export default function HeroBackground() {
  return (
    <>
      {/* LEFT PINK GLOW */}
      <div className="absolute top-[-180px] left-[-160px] w-[520px] h-[520px] rounded-full bg-pink-200 blur-3xl opacity-50"></div>

      {/* RIGHT YELLOW GLOW */}
      <div className="absolute top-[120px] right-[-180px] w-[560px] h-[560px] rounded-full bg-yellow-100 blur-3xl opacity-70"></div>

      {/* CENTER LIGHT */}
      <div className="absolute top-[180px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-white blur-3xl opacity-80"></div>

      {/* GRID */}
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
          backgroundSize: "70px 70px",
        }}
      ></div>

      {/* FLOATING BLUR SHAPES */}
      <div className="absolute top-[20%] left-[8%] w-28 h-28 rounded-full bg-[var(--accent-soft)] blur-2xl opacity-70 animate-float-soft"></div>

      <div className="absolute bottom-[12%] right-[10%] w-40 h-40 rounded-full bg-yellow-100 blur-2xl opacity-70 animate-float-soft"></div>

      <div className="absolute top-[55%] left-[42%] w-24 h-24 rounded-full bg-pink-100 blur-2xl opacity-70 animate-float-soft"></div>
    </>
  );
}
