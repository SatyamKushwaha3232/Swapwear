import { useEffect } from "react";

export default function useClickOutside(ref, handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;

    function handlePointerDown(event) {
      const node = ref?.current;
      if (!node || node.contains(event.target)) return;
      handler?.(event);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") handler?.(event);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, { passive: true });
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, handler, ref]);
}
