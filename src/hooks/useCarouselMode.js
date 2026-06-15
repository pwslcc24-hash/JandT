import { useEffect, useState } from "react";

const CAROUSEL_BREAKPOINT = 1024;

export function useCarouselMode() {
  const [isCarousel, setIsCarousel] = useState(false);

  useEffect(() => {
    const check = () => setIsCarousel(window.innerWidth < CAROUSEL_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isCarousel;
}
