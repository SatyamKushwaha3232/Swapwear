import { useMemo, useState } from "react";
import { Play, Image as ImageIcon, Maximize2 } from "lucide-react";

export default function DetailGallery({ item }) {
  const media = useMemo(() => {
    const images = Array.isArray(item?.images) && item.images.length > 0 ? item.images : item?.image ? [item.image] : [];
    return item?.video ? [...images, item.video] : images;
  }, [item]);

  const [active, setActive] = useState(0);
  const activeMedia = media[active];
  const isVideo = item?.video && activeMedia === item.video;

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-[46px] border border-pink-100 bg-pink-50 shadow-[0_34px_100px_rgba(15,23,42,0.12)]">
        <div className="aspect-[4/5] w-full overflow-hidden bg-slate-100">
          {activeMedia ? (
            isVideo ? (
              <video src={activeMedia} controls className="h-full w-full object-cover" />
            ) : (
              <img src={activeMedia} alt={item?.title || "SwapWear item"} className="h-full w-full object-cover transition duration-700 hover:scale-105" />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl font-black text-pink-200">SW</div>
          )}
        </div>

        <div className="absolute left-5 top-5 flex gap-2">
          <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-black text-pink-500 shadow-lg backdrop-blur-xl">Premium Listing</span>
          {item?.video && <span className="rounded-full bg-slate-950/80 px-4 py-2 text-xs font-black text-white shadow-lg backdrop-blur-xl flex items-center gap-1"><Play size={13} /> Video</span>}
        </div>

        <button className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg backdrop-blur-xl">
          <Maximize2 size={19} />
        </button>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {(media.length ? media : [""]).slice(0, 5).map((src, index) => {
          const thumbVideo = item?.video && src === item.video;
          return (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={`relative aspect-square overflow-hidden rounded-[22px] border-2 bg-pink-50 transition ${active === index ? "border-pink-500 shadow-lg" : "border-white hover:border-pink-200"}`}
            >
              {src ? (
                thumbVideo ? (
                  <div className="flex h-full w-full items-center justify-center bg-slate-950 text-white"><Play size={24} /></div>
                ) : (
                  <img src={src} alt="thumbnail" className="h-full w-full object-cover" />
                )
              ) : (
                <div className="flex h-full w-full items-center justify-center text-pink-300"><ImageIcon size={24} /></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
