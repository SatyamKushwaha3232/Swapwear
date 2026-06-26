import { useEffect, useRef, useState } from "react";
import { Heart, MapPin, Play, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProductCard({ item }) {
  const [hovered, setHovered] = useState(false);
  const [mode, setMode] = useState("image");
  const [imageIndex, setImageIndex] = useState(0);
  const videoRef = useRef(null);

  const images = item?.images?.length
    ? item.images
    : [item?.image].filter(Boolean);

  const hasVideo = Boolean(item?.hasVideo && item?.video);

  useEffect(() => {
    if (!hovered) return;

    if (hasVideo) {
      setMode("video");
      setImageIndex(0);
    } else {
      setMode("image");
    }
  }, [hovered, hasVideo]);

  useEffect(() => {
    if (!hovered || mode !== "image" || images.length <= 1) return;

    const interval = setInterval(() => {
      setImageIndex((prev) => {
        if (prev >= images.length - 1) {
          if (hasVideo) {
            setMode("video");
            return 0;
          }

          return 0;
        }

        return prev + 1;
      });
    }, 950);

    return () => clearInterval(interval);
  }, [hovered, mode, images.length, hasVideo]);

  const handleVideoEnded = () => {
    setMode("image");
    setImageIndex(0);
  };

  return (
    <article
      className="group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setMode("image");
        setImageIndex(0);

        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      }}
    >
      <Link to={`/item/${item.id}`} className="block">
        <div className="relative overflow-hidden rounded-[34px] bg-white/55 backdrop-blur-2xl border border-white/50 shadow-[0_18px_55px_rgba(15,23,42,0.07)] transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_28px_90px_rgba(255,105,180,0.18)]">
          <div className="relative aspect-[0.84] overflow-hidden">
            {hovered && hasVideo && mode === "video" ? (
              <video
                ref={videoRef}
                src={item.video}
                autoPlay
                muted
                playsInline
                onEnded={handleVideoEnded}
                className="w-full h-full object-cover scale-[1.04]"
              />
            ) : (
              <img
                src={images[imageIndex]}
                alt={item.title}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.06]"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition"></div>

            {hasVideo && (
              <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-white/75 backdrop-blur-xl border border-white/50 text-xs font-black flex items-center gap-2">
                <Play size={12} fill="currentColor" />
                {mode === "video" ? "Playing" : "Preview"}
              </div>
            )}

            <button className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/75 backdrop-blur-xl border border-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <Heart size={18} />
            </button>

            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
              {hasVideo && (
                <span
                  className={`h-[5px] rounded-full transition-all ${
                    mode === "video" ? "w-9 bg-white" : "w-3 bg-white/45"
                  }`}
                />
              )}

              {images.map((_, index) => (
                <span
                  key={index}
                  className={`h-[5px] rounded-full transition-all ${
                    mode === "image" && imageIndex === index
                      ? "w-9 bg-white"
                      : "w-3 bg-white/45"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="pt-5 px-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-[22px] font-black leading-tight tracking-[-0.5px] truncate">
                {item.title}
              </h3>

              <p className="mt-2 text-[15px] text-[var(--muted)] font-semibold truncate">
                {item.brand} • Size {item.size}
              </p>
            </div>

            <div className="shrink-0 px-4 py-3 rounded-full bg-pink-400/25 border border-white/50 text-center">
              <p className="text-lg font-black leading-none">{item.points}</p>
              <p className="text-[11px] text-[var(--muted)] font-bold mt-1">
                pts
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">

  <div className="w-10 h-10 rounded-full bg-pink-400/25 border border-white/50 flex items-center justify-center font-black text-sm text-[var(--accent)] shrink-0">
    {(item.owner || "S").charAt(0).toUpperCase()}
  </div>

  <div className="min-w-0">

    <p className="text-[12px] text-[var(--muted)] font-semibold">
      Listed by
    </p>

    <p className="font-black truncate">
      {item.owner || "SwapWear User"}
    </p>

  </div>

</div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[14px] text-[var(--muted)] font-semibold min-w-0">
              <MapPin size={15} />
              <span className="truncate">{item.location}</span>
            </div>

            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/55 backdrop-blur-xl border border-white/50 font-black text-sm group-hover:bg-pink-400/25 transition">
              View
              <ArrowUpRight size={15} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}