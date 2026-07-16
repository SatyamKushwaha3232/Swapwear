import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getListings } from "../services/listings";

export const ROTATION_INTERVAL_MS = 5 * 60 * 1000;

export function listingImage(item) {
  return item?.image || (Array.isArray(item?.images) ? item.images[0] : "") || "/icons.svg";
}

export default function useRotatingListings(limit = 3, options = {}) {
  const {
    refreshMs = ROTATION_INTERVAL_MS,
    includeUnavailable = false,
    ...filters
  } = options;
  const optionsKey = JSON.stringify({ includeUnavailable, ...filters });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rotation, setRotation] = useState(0);
  const [updatedAt, setUpdatedAt] = useState(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadListings = useCallback(
    async (showLoader = false) => {
      if (showLoader) {
        setLoading(true);
      }

      setError("");
      const parsedOptions = JSON.parse(optionsKey);
      const response = await getListings(null, parsedOptions);

      if (!mountedRef.current) {
        return response;
      }

      if (response.success) {
        setItems(response.data || []);
        setRotation(0);
        setUpdatedAt(new Date().toISOString());
      } else {
        setError(response.error || "Unable to load listings");
      }

      setLoading(false);
      return response;
    },
    [optionsKey]
  );

  useEffect(() => {
    loadListings(true);
  }, [loadListings]);

  useEffect(() => {
    if (items.length <= limit) return undefined;

    const interval = setInterval(() => {
      setRotation((prev) => (prev + limit) % items.length);
    }, ROTATION_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [items.length, limit]);

  useEffect(() => {
    if (!refreshMs) return undefined;

    const interval = setInterval(() => {
      loadListings(false);
    }, refreshMs);

    return () => clearInterval(interval);
  }, [loadListings, refreshMs]);

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
    error,
    rotation,
    updatedAt,
    reload: () => loadListings(true),
  };
}
