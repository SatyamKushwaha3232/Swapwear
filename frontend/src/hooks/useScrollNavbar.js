import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/* =========================================
   Premium Scroll Navbar Hook
========================================= */

export default function useScrollNavbar() {
  const location = useLocation();

  const [showSearch, setShowSearch] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {

      /* =========================================
         Current scroll position
      ========================================= */

      const currentScroll = window.scrollY;

      /* =========================================
         Navbar background effect
      ========================================= */

      setIsScrolled(currentScroll > 20);

      /* =========================================
         Search bar visibility logic
      ========================================= */

      if (location.pathname !== "/") {

        /*
          Other pages:
          Search always visible
        */

        setShowSearch(true);

      } else {

        /*
          Home page:
          Show search only after hero scroll
        */

        setShowSearch(currentScroll > 420);
      }
    };

    /*
      Run initially
    */

    handleScroll();

    /*
      Scroll listener
    */

    window.addEventListener("scroll", handleScroll);

    /*
      Cleanup
    */

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };

  }, [location.pathname]);

  return {
    showSearch,
    isScrolled,
  };
}
