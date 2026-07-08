import { useEffect, useState } from "react";

function getDevice() {
  const width = window.innerWidth;

  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1180,
    isDesktop: width >= 1180,
  };
}

export default function useDevice() {
  const [device, setDevice] = useState(getDevice);

  useEffect(() => {
    function handleResize() {
      setDevice(getDevice());
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return device;
}