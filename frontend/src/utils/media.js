export function getListingImages(item) {
  if (Array.isArray(item?.images) && item.images.length > 0) return item.images;
  if (item?.image) return [item.image];
  return [];
}

export function resolveMediaUrl(url) {
  if (!url) return "";
  const value = String(url).trim();
  if (!value || /^https?:\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const apiOrigin = apiBase.replace(/\/api\/?$/, "");
  return `${apiOrigin}${value.startsWith("/") ? value : `/${value}`}`;
}

export function getInitials(name = "SwapWear User") {
  return String(name).trim().charAt(0).toUpperCase() || "U";
}
