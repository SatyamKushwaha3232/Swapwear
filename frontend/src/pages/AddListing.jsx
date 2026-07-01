import { useEffect, useMemo, useState } from "react";
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
  X,
  Crown,
  Eye,
} from "lucide-react";

import { createListing } from "../services/listings";

const initialForm = {
  title: "",
  brand: "",
  category: "Jackets",
  size: "",
  location: "",
  points: 500,
  condition: "Good",
  description: "",
};

const categories = [
  "Jackets",
  "Hoodies",
  "Shirts",
  "Tshirts",
  "Jeans",
  "Sneakers",
  "Ethnic",
  "Dresses",
  "Kurti",
  "Saree",
  "Accessories",
  "Vintage",
];

const sizes = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "Free Size"];

const conditions = ["New", "Like New", "Excellent", "Good", "Used"];

export default function AddListing() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreview, setVideoPreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [imagePreviews, videoPreview]);

  const coverImage = imagePreviews[0] || "/icons.svg";

  const descriptionCount = useMemo(
    () => formData.description.length,
    [formData.description]
  );

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "description" && value.length > 500) return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleImages(e) {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const validFiles = files.filter((file) => file.type.startsWith("image/"));

    if (validFiles.length !== files.length) {
      toast.error("Only image files are allowed");
      return;
    }

    if (validFiles.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    imagePreviews.forEach((url) => URL.revokeObjectURL(url));

    setImages(validFiles);
    setImagePreviews(validFiles.map((file) => URL.createObjectURL(file)));
  }

  function removeImage(index) {
    const nextImages = images.filter((_, i) => i !== index);
    const nextPreviews = imagePreviews.filter((_, i) => i !== index);

    URL.revokeObjectURL(imagePreviews[index]);

    setImages(nextImages);
    setImagePreviews(nextPreviews);
  }

  function handleVideo(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Only video file is allowed");
      return;
    }

    if (videoPreview) URL.revokeObjectURL(videoPreview);

    setVideo(file);
    setVideoPreview(URL.createObjectURL(file));
  }

  function removeVideo() {
    if (videoPreview) URL.revokeObjectURL(videoPreview);

    setVideo(null);
    setVideoPreview("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    console.log("Publish button clicked");
    console.log("Form Data:", formData);
    console.log("Images:", images);
    console.log("Video:", video);

    if (!formData.title.trim()) {
      toast.error("Please enter item title");
      return;
    }

    if (!formData.brand.trim()) {
      toast.error("Please enter brand name");
      return;
    }

    if (!formData.size.trim()) {
      toast.error("Please select size");
      return;
    }

    if (!formData.location.trim()) {
      toast.error("Please enter location");
      return;
    }

    if (images.length < 1) {
      toast.error("Upload at least 1 product image");
      return;
    }

    try {
      setLoading(true);

      const response = await createListing(formData, images, video);

      console.log("Create listing response:", response);

      if (!response.success) {
        toast.error(response.error || "Unable to publish listing");
        return;
      }

      toast.success("Listing published successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error("Publish error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section-space pt-24 md:pt-28">
      <div className="container-main">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-pink-400/20 backdrop-blur-xl border border-white/60 text-[var(--accent)] font-black">
            <Sparkles size={16} />
            Premium Upload Studio
          </div>

          <h1 className="mt-5 text-4xl md:text-6xl xl:text-7xl font-black tracking-[-3px] leading-[1]">
            Add your swap item.
          </h1>

          <p className="mt-5 text-lg md:text-xl text-[var(--muted)] leading-relaxed max-w-3xl">
            Upload same-product images, add item details, and publish your
            listing to the SwapWear marketplace.
          </p>
        </div>

        <div className="mt-10 grid xl:grid-cols-[0.95fr_1.05fr] gap-8">
          <div className="space-y-8">
            <div className="rounded-[38px] bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_24px_80px_rgba(15,23,42,0.08)] p-6 md:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black">
                    Product Media
                  </h2>
                  <p className="mt-1 text-[var(--muted)] font-semibold">
                    {images.length}/5 images uploaded
                  </p>
                </div>

                {images.length > 0 && (
                  <span className="px-4 py-2 rounded-full bg-pink-100 text-pink-600 text-sm font-black">
                    First image is cover
                  </span>
                )}
              </div>

              {imagePreviews.length === 0 ? (
                <label className="mt-7 min-h-[380px] rounded-[34px] border-2 border-dashed border-pink-200 bg-white/40 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8 cursor-pointer hover:bg-pink-50/40 transition">
                  <div className="w-24 h-24 rounded-full bg-pink-400/20 border border-pink-300/30 text-[var(--accent)] flex items-center justify-center shadow-lg">
                    <ImagePlus size={42} />
                  </div>

                  <h3 className="mt-7 text-3xl font-black">
                    Upload product photos
                  </h3>

                  <p className="mt-3 text-[var(--muted)] leading-relaxed max-w-md">
                    Add front, back, side, close-up and wearing photo of the
                    same product.
                  </p>

                  <span className="mt-6 h-13 px-6 rounded-full bg-pink-400/35 border border-white/60 font-black inline-flex items-center gap-2">
                    <Upload size={18} />
                    Choose Images
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleImages}
                  />
                </label>
              ) : (
                <div className="mt-7 grid grid-cols-2 gap-4">
                  {imagePreviews.map((img, index) => (
                    <div
                      key={img}
                      className="relative rounded-[28px] overflow-hidden border border-white/60 bg-white/50 group"
                    >
                      <img
                        src={img}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-[220px] object-cover"
                      />

                      {index === 0 && (
                        <span className="absolute left-3 top-3 px-3 py-1 rounded-full bg-black/70 text-white text-xs font-black flex items-center gap-1">
                          <Crown size={13} />
                          Cover
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-3 top-3 w-9 h-9 rounded-full bg-white/90 text-red-500 flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={17} />
                      </button>
                    </div>
                  ))}

                  {images.length < 5 && (
                    <label className="h-[220px] rounded-[28px] border-2 border-dashed border-pink-200 bg-white/35 flex flex-col items-center justify-center cursor-pointer hover:bg-pink-50/40 transition">
                      <ImagePlus size={34} className="text-pink-500" />
                      <p className="mt-3 font-black">Add More</p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={(e) => {
                          const newFiles = Array.from(e.target.files || []);
                          const combined = [...images, ...newFiles].slice(0, 5);

                          if (images.length + newFiles.length > 5) {
                            toast.error("Only 5 images allowed");
                          }

                          imagePreviews.forEach((url) =>
                            URL.revokeObjectURL(url)
                          );

                          setImages(combined);
                          setImagePreviews(
                            combined.map((file) => URL.createObjectURL(file))
                          );
                        }}
                      />
                    </label>
                  )}
                </div>
              )}

              <div className="mt-6">
                {!videoPreview ? (
                  <label className="w-full h-16 rounded-full bg-white/55 backdrop-blur-xl border border-white/60 font-black hover:border-pink-300 transition flex items-center justify-center gap-3 cursor-pointer">
                    <Video size={18} />
                    Upload Video Optional
                    <input
                      type="file"
                      accept="video/*"
                      hidden
                      onChange={handleVideo}
                    />
                  </label>
                ) : (
                  <div className="relative rounded-[30px] overflow-hidden border border-white/60 bg-white/50">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full h-[280px] object-cover"
                    />

                    <button
                      type="button"
                      onClick={removeVideo}
                      className="absolute right-4 top-4 w-10 h-10 rounded-full bg-white/90 text-red-500 flex items-center justify-center"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[38px] bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_24px_80px_rgba(15,23,42,0.08)] p-6 md:p-7">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-400/20 font-black">
                <Eye size={17} />
                Live Preview
              </div>

              <div className="mt-6 rounded-[32px] bg-white/70 border border-white/60 overflow-hidden shadow-lg">
                <img
                  src={coverImage}
                  alt="Preview"
                  onError={(e) => {
                    e.currentTarget.src = "/icons.svg";
                  }}
                  className="w-full h-[340px] object-cover bg-white"
                />

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-black">
                        {formData.title || "Product title"}
                      </h3>

                      <p className="mt-1 text-[var(--muted)] font-semibold">
                        {formData.brand || "Brand"} •{" "}
                        {formData.category || "Category"}
                      </p>
                    </div>

                    <span className="px-4 py-2 rounded-full bg-pink-100 text-pink-600 font-black">
                      {formData.points || 0} pts
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <PreviewPill label={formData.size || "Size"} />
                    <PreviewPill label={formData.condition || "Condition"} />
                    <PreviewPill label={formData.location || "Location"} />
                  </div>

                  <p className="mt-5 text-[var(--muted)] leading-relaxed line-clamp-3">
                    {formData.description ||
                      "Your item description will appear here."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[38px] bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_24px_80px_rgba(15,23,42,0.08)] p-6 md:p-7 h-fit">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    {categories.map((cat) => (
                      <option key={cat}>{cat}</option>
                    ))}
                  </select>
                </InputBlock>

                <InputBlock icon={Ruler} label="Size">
                  <select
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className="input-premium"
                  >
                    <option value="">Select Size</option>
                    {sizes.map((size) => (
                      <option key={size}>{size}</option>
                    ))}
                  </select>
                </InputBlock>

                <InputBlock label="Condition">
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="input-premium"
                  >
                    {conditions.map((condition) => (
                      <option key={condition}>{condition}</option>
                    ))}
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

                <InputBlock label={`Swap Points: ${formData.points}`}>
                  <input
                    type="range"
                    name="points"
                    min="0"
                    max="5000"
                    step="50"
                    value={formData.points}
                    onChange={handleChange}
                    className="mt-5 w-full accent-pink-400"
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
                  className="mt-3 w-full p-6 rounded-[28px] bg-white/55 backdrop-blur-xl border border-white/60 outline-none resize-none font-semibold"
                />

                <div className="mt-2 text-right text-sm font-black text-[var(--muted)]">
                  {descriptionCount}/500
                </div>
              </InputBlock>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[68px] rounded-full bg-pink-500 text-white font-black text-lg hover:bg-pink-600 transition shadow-[0_14px_40px_rgba(255,105,180,0.30)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Publishing Listing..." : "Publish Listing"}
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

function PreviewPill({ label }) {
  return (
    <span className="px-4 py-2 rounded-full bg-white/70 border border-white/60 text-sm font-black">
      {label}
    </span>
  );
}