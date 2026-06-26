import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Upload,
  ImagePlus,
  Shirt,
  MapPin,
  Tag,
  Star,
  FileText,
  Sparkles,
  Video,
  Ruler,
} from "lucide-react";

import { createListing } from "../services/listings";

const initialForm = {
  title: "",
  brand: "",
  category: "Jackets",
  size: "",
  location: "",
  points: "",
  condition: "Good",
  description: "",
};

export default function AddListing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreview, setVideoPreview] = useState("");
  const [formData, setFormData] = useState(initialForm);

  function handleChange(e) {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function handleImages(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setImages(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  }

  function handleVideo(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideo(file);
    setVideoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Item title is required");
      return;
    }

    if (!formData.size.trim()) {
      toast.error("Size is required");
      return;
    }

    if (images.length === 0) {
      toast.error("Upload at least 1 image");
      return;
    }

    setLoading(true);

    const response = await createListing(formData, images, video);

    if (!response.success) {
      toast.error(response.error);
      setLoading(false);
      return;
    }

    toast.success("Listing published successfully");
    setFormData(initialForm);
    setImages([]);
    setVideo(null);
    setImagePreviews([]);
    setVideoPreview("");
    setLoading(false);
    navigate("/dashboard");
  }

  return (
    <section className="section-space pt-28">
      <div className="container-main">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-400/20 backdrop-blur-xl border border-white/50 text-[var(--accent)] font-black">
            <Sparkles size={16} />
            Create Listing
          </div>

          <h1 className="mt-6 text-5xl md:text-6xl xl:text-7xl font-black tracking-[-3px] leading-[1]">
            Upload your fashion item.
          </h1>

          <p className="mt-6 text-xl text-[var(--muted)] leading-relaxed max-w-3xl">
            Add images, size, category, points and optional video to publish a
            real marketplace listing.
          </p>
        </div>

        <div className="mt-14 grid xl:grid-cols-[0.88fr_1.12fr] gap-10">
          <div className="rounded-[42px] bg-white/55 backdrop-blur-2xl border border-white/50 shadow-[0_25px_80px_rgba(15,23,42,0.08)] p-7">
            <div className="space-y-6">
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {imagePreviews.map((img, index) => (
                    <div
                      key={img}
                      className="rounded-[28px] overflow-hidden border border-white/50 bg-white/40"
                    >
                      <img
                        src={img}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-[240px] object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {videoPreview && (
                <div className="rounded-[32px] overflow-hidden border border-white/50 bg-white/40">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full h-[320px] object-cover"
                  />
                </div>
              )}

              {imagePreviews.length === 0 && (
                <div className="min-h-[500px] rounded-[36px] border-2 border-dashed border-white/50 bg-white/35 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8">
                  <div className="w-28 h-28 rounded-full bg-pink-400/20 border border-pink-300/30 text-[var(--accent)] flex items-center justify-center shadow-lg">
                    <ImagePlus size={46} />
                  </div>

                  <h2 className="mt-8 text-4xl font-black">
                    Upload Images & Video
                  </h2>

                  <p className="mt-5 text-[17px] text-[var(--muted)] leading-relaxed max-w-md">
                    Add 3-5 premium images and optional showcase video.
                  </p>
                </div>
              )}

              <label className="w-full h-[64px] rounded-full bg-pink-400/35 backdrop-blur-xl border border-white/50 font-black shadow-[0_12px_34px_rgba(255,105,180,0.20)] hover:bg-pink-400/50 transition flex items-center justify-center gap-3 cursor-pointer">
                <Upload size={18} />
                Upload Images
                <input type="file" accept="image/*" multiple hidden onChange={handleImages} />
              </label>

              <label className="w-full h-[64px] rounded-full bg-white/50 backdrop-blur-xl border border-white/50 font-black hover:border-pink-300 transition flex items-center justify-center gap-3 cursor-pointer">
                <Video size={18} />
                Upload Video (Optional)
                <input type="file" accept="video/*" hidden onChange={handleVideo} />
              </label>
            </div>
          </div>

          <div className="rounded-[42px] bg-white/55 backdrop-blur-2xl border border-white/50 shadow-[0_25px_80px_rgba(15,23,42,0.08)] p-7">
            <form onSubmit={handleSubmit} className="space-y-7">
              <InputBlock icon={Shirt} label="Item Title">
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Vintage Denim Jacket"
                  className="input-premium"
                />
              </InputBlock>

              <div className="grid sm:grid-cols-2 gap-5">
                <InputBlock icon={Star} label="Brand">
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Levi's"
                    className="input-premium"
                  />
                </InputBlock>

                <InputBlock icon={Tag} label="Category">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input-premium"
                  >
                    <option>Jackets</option>
                    <option>Hoodies</option>
                    <option>Sneakers</option>
                    <option>Ethnic</option>
                    <option>Dresses</option>
                    <option>Streetwear</option>
                    <option>Vintage</option>
                  </select>
                </InputBlock>

                <InputBlock icon={Ruler} label="Size">
                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    placeholder="M, L, XL, XXL, 42, 32"
                    className="input-premium"
                  />
                </InputBlock>

                <InputBlock label="Condition">
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="input-premium"
                  >
                    <option>New</option>
                    <option>Like New</option>
                    <option>Good</option>
                    <option>Used</option>
                  </select>
                </InputBlock>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <InputBlock icon={MapPin} label="Location">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Jabalpur"
                    className="input-premium"
                  />
                </InputBlock>

                <InputBlock label="Swap Points">
                  <input
                    type="number"
                    name="points"
                    value={formData.points}
                    onChange={handleChange}
                    placeholder="1200"
                    className="input-premium"
                  />
                </InputBlock>
              </div>

              <InputBlock icon={FileText} label="Description">
                <textarea
                  rows="7"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe item, fit, condition and swap preferences..."
                  className="mt-3 w-full p-6 rounded-[28px] bg-white/55 backdrop-blur-xl border border-white/50 outline-none resize-none"
                />
              </InputBlock>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[68px] rounded-full bg-pink-400/35 backdrop-blur-xl border border-white/50 font-black text-lg hover:bg-pink-400/50 transition shadow-[0_14px_40px_rgba(255,105,180,0.22)] disabled:opacity-60"
              >
                {loading ? "Publishing..." : "Publish Premium Listing"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function InputBlock({ icon: Icon, label, children }) {
  return (
    <div>
      <label className="font-black flex items-center gap-2">
        {Icon && <Icon size={18} />}
        {label}
      </label>
      {children}
    </div>
  );
}
