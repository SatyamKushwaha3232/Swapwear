import { useMemo, useState } from "react";
import { ImageIcon, Play, Sparkles, Video } from "lucide-react";

export default function DetailGallery({ item }) {
  const media = useMemo(() => {
    const images =
      Array.isArray(item?.images) && item.images.length
        ? item.images.slice(0, 5)
        : item?.image
        ? [item.image]
        : ["/icons.svg"];

    const imageMedia = images.map((src, index) => ({
      type: "image",
      src,
      label: index === 0 ? "Cover" : `Image ${index + 1}`,
    }));

    if (item?.video) {
      imageMedia.push({
        type: "video",
        src: item.video,
        label: "Video",
      });
    }

    return imageMedia;
  }, [item]);

  const [activeIndex, setActiveIndex] = useState(0);
  const active = media[activeIndex] || media[0];

  return (
    <div className="min-w-0 rounded-[36px] border border-pink-100 bg-white/85 p-4 shadow-[0_24px_75px_rgba(15,23,42,0.07)] backdrop-blur-2xl md:p-5">
      <div className="relative overflow-hidden rounded-[30px] bg-pink-50">
        <div className="absolute left-4 top-4 z-10 inline-flex max-w-[calc(100%-32px)] items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-black text-pink-500 shadow-lg backdrop-blur-xl">
          <Sparkles size={16} className="shrink-0" />
          <span className="truncate">{item?.category || "Fashion"}</span>
        </div>

        <div className="aspect-[4/4.7] w-full overflow-hidden sm:aspect-[4/4.2] lg:aspect-[4/4.4] xl:aspect-[4/4.2]">
          {active?.type === "video" ? (
            <video
              src={active.src}
              controls
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src={active?.src || "/icons.svg"}
              alt={item?.title || "Product"}
              onError={(e) => {
                e.currentTarget.src = "/icons.svg";
              }}
              className="h-full w-full object-cover transition duration-700 hover:scale-105"
            />
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-3">
        {media.slice(0, 6).map((file, index) => (
          <button
            key={`${file.src}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`relative min-w-0 overflow-hidden rounded-[18px] border-2 bg-pink-50 transition ${
              activeIndex === index
                ? "border-pink-500 shadow-[0_12px_30px_rgba(255,79,163,0.2)]"
                : "border-white hover:border-pink-200"
            }`}
          >
            <div className="aspect-square w-full">
              {file.type === "video" ? (
                <div className="flex h-full w-full items-center justify-center bg-slate-950 text-white">
                  <Play size={24} />
                </div>
              ) : (
                <img
                  src={file.src}
                  alt={file.label}
                  onError={(e) => {
                    e.currentTarget.src = "/icons.svg";
                  }}
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <span className="absolute bottom-1 left-1 right-1 truncate rounded-full bg-white/90 px-2 py-1 text-[10px] font-black text-slate-700">
              {file.type === "video" ? "Video" : index === 0 ? "Cover" : index + 1}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <GalleryInfo icon={ImageIcon} label={`${Math.min(media.length, 5)} product photos`} />
        <GalleryInfo
          icon={Video}
          label={item?.video ? "Video preview available" : "No video uploaded"}
        />
      </div>
    </div>
  );
}

function GalleryInfo({ icon: Icon, label }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-[20px] bg-pink-50/70 px-4 py-3">
      <Icon size={18} className="shrink-0 text-pink-500" />
      <span className="truncate text-sm font-black text-slate-700">
        {label}
      </span>
    </div>
  );
}