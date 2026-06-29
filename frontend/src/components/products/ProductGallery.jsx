import { useState } from "react";
import { Play, Image as ImageIcon } from "lucide-react";

export default function ProductGallery({ item }) {
  const [selectedImage, setSelectedImage] = useState(item.images?.[0]);
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div>
      <div className="relative overflow-hidden rounded-[44px] bg-white/55 backdrop-blur-2xl border border-white/50 shadow-[0_25px_80px_rgba(15,23,42,0.10)] p-3">
        <div className="relative overflow-hidden rounded-[34px] bg-[var(--bg-soft)]">
          {showVideo && item.video ? (
            <video
              src={item.video}
              autoPlay
              muted
              loop
              playsInline
              className="w-full aspect-[4/3] object-cover"
            />
          ) : (
            <img
              src={selectedImage}
              alt={item.title}
              className="w-full aspect-[4/3] object-cover"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent"></div>

          {item.hasVideo && item.video && (
            <button
              type="button"
              onClick={() => setShowVideo((prev) => !prev)}
              className="absolute top-5 left-5 px-5 py-3 rounded-full bg-white/75 backdrop-blur-xl border border-white/60 shadow-lg flex items-center gap-2 font-black hover:bg-pink-400/25 transition"
            >
              {showVideo ? (
                <>
                  <ImageIcon size={16} />
                  View Photos
                </>
              ) : (
                <>
                  <Play size={15} fill="currentColor" />
                  Play Preview
                </>
              )}
            </button>
          )}

          <div className="absolute bottom-5 left-5 px-5 py-3 rounded-full bg-white/75 backdrop-blur-xl border border-white/60 shadow-lg font-black">
            {item.condition}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-5">
        {item.images.map((image, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              setSelectedImage(image);
              setShowVideo(false);
            }}
            className={`overflow-hidden rounded-[24px] border-2 bg-white/55 backdrop-blur-xl transition shadow-sm ${
              selectedImage === image && !showVideo
                ? "border-[var(--accent)]"
                : "border-white/50"
            }`}
          >
            <img
              src={image}
              alt={`${item.title} view ${index + 1}`}
              className="w-full aspect-square object-cover hover:scale-110 transition duration-500"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
