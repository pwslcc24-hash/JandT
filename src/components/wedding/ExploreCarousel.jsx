import { useCallback, useEffect, useRef, useState } from "react";
import EditableExploreCard from "./EditableExploreCard";

export default function ExploreCarousel({ nav }) {
  const scrollRef = useRef(null);
  const [active, setActive] = useState(0);

  const updateActive = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const slides = el.querySelectorAll("[data-slide]");
    if (!slides.length) return;

    const center = el.scrollLeft + el.clientWidth * 0.42;
    let closest = 0;
    let minDist = Infinity;

    slides.forEach((slide, i) => {
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const dist = Math.abs(center - slideCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });

    setActive(closest);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateActive();
    el.addEventListener("scroll", updateActive, { passive: true });
    return () => el.removeEventListener("scroll", updateActive);
  }, [updateActive]);

  const goTo = (index) => {
    const el = scrollRef.current;
    const slide = el?.querySelector(`[data-slide="${index}"]`);
    if (!slide || !el) return;
    el.scrollTo({
      left: slide.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft),
      behavior: "smooth",
    });
  };

  return (
    <div className="explore-carousel">
      <div className="cards-scroll" ref={scrollRef}>
        {nav.map((item, i) => (
          <div key={item.slug} className="carousel-slide" data-slide={i}>
            <EditableExploreCard item={item} index={i} />
          </div>
        ))}
      </div>
      <div className="carousel-indicators" aria-hidden="true">
        {nav.map((item, i) => (
          <button
            key={item.slug}
            type="button"
            className={`carousel-indicator${i === active ? " active" : ""}`}
            aria-label={`Go to ${item.label}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
