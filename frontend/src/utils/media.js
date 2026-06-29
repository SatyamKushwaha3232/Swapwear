export function getListingImages(item) {
  if (Array.isArray(item?.images) && item.images.length > 0) return item.images;
  if (item?.image) return [item.image];
  return [];
}

export function getInitials(name = "SwapWear User") {
  return String(name).trim().charAt(0).toUpperCase() || "U";
}
