export default function SectionHeader({ eyebrow, title, text, action }) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-4xl">
        {eyebrow && <p className="font-black text-pink-500">{eyebrow}</p>}
        <h2 className="mt-3 text-4xl font-black tracking-[-2px] text-slate-950 md:text-6xl">{title}</h2>
        {text && <p className="mt-4 max-w-2xl text-lg font-semibold leading-relaxed text-slate-500">{text}</p>}
      </div>
      {action}
    </div>
  );
}
