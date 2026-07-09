import { useEffect, useMemo, useState } from "react";

import { getListings } from "../services/listings";

export const ROTATION_INTERVAL_MS = 5 * 60 * 1000;

export function listingImage(item) {
  return item?.image || (Array.isArray(item?.images) ? item.images[0] : "") || "/icons.svg";
}

export default function useRotatingListings(limit = 3, options = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function loadListings() {
      setLoading(true);
      const response = await getListings(null, {
        includeUnavailable: Boolean(options.includeUnavailable),
      });

      if (mounted && response.success) {
        setItems(response.data || []);
      }

      if (mounted) setLoading(false);
    }

    loadListings();

    return () => {
      mounted = false;
    };
  }, [options.includeUnavailable]);

  useEffect(() => {
    if (items.length <= limit) return undefined;

    const interval = setInterval(() => {
      setRotation((prev) => (prev + limit) % items.length);
    }, ROTATION_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [items.length, limit]);

  const visibleItems = useMemo(() => {
    if (items.length === 0) return [];
    if (items.length <= limit) return items;

    return Array.from({ length: limit }, (_, index) => {
      return items[(rotation + index) % items.length];
    });
  }, [items, limit, rotation]);

  return {
    allItems: items,
    items: visibleItems,
    loading,
    rotation,
  };
}
