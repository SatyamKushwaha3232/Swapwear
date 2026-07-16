import { listingImage } from "../hooks/useRotatingListings";

const TITLE_CASE_SMALL_WORDS = new Set(["and", "or", "of", "the"]);

export function cleanLabel(value, fallback = "Fashion") {
  const label = String(value || "").trim();
  if (!label) return fallback;

  return label
    .split(/\s+/)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index > 0 && TITLE_CASE_SMALL_WORDS.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

export function uniqueLabels(items, field, limit = 8, fallback = []) {
  const labels = [];
  const seen = new Set();

  items.forEach((item) => {
    const label = cleanLabel(item?.[field], "");
    const key = label.toLowerCase();

    if (label && !seen.has(key)) {
      seen.add(key);
      labels.push(label);
    }
  });

  return (labels.length ? labels : fallback).slice(0, limit);
}

export function categoryHighlights(items, limit = 8) {
  const grouped = new Map();

  items.forEach((item) => {
    const title = cleanLabel(item?.category);
    const current = grouped.get(title) || {
      title,
      count: 0,
      image: listingImage(item),
      latest: item?.created_at || "",
      points: 0,
      item,
    };

    current.count += 1;
    current.points += Number(item?.points || 0);

    if (new Date(item?.created_at || 0) > new Date(current.latest || 0)) {
      current.image = listingImage(item);
      current.latest = item?.created_at || "";
      current.item = item;
    }

    grouped.set(title, current);
  });

  return [...grouped.values()]
    .map((category) => ({
      ...category,
      averagePoints: Math.round(category.points / Math.max(category.count, 1)),
    }))
    .sort((a, b) => b.count - a.count || b.averagePoints - a.averagePoints)
    .slice(0, limit);
}

export function marketplaceStats(items) {
  const availableItems = items.filter((item) => item?.isAvailable !== false);
  const categoryCount = new Set(items.map((item) => cleanLabel(item?.category, "")).filter(Boolean)).size;
  const brandCount = new Set(items.map((item) => cleanLabel(item?.brand, "")).filter(Boolean)).size;
  const totalPoints = items.reduce((sum, item) => sum + Number(item?.points || 0), 0);

  return {
    totalItems: items.length,
    availableItems: availableItems.length,
    categoryCount,
    brandCount,
    averagePoints: items.length ? Math.round(totalPoints / items.length) : 0,
  };
}
