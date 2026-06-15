import { useCarouselMode } from "@/hooks/useCarouselMode";
import ExploreCard from "./ExploreCard";
import ExploreCarousel from "./ExploreCarousel";
import EditableText from "@/components/editor/EditableText";

export default function ExploreSection({ nav, label = "Explore" }) {
  const isCarousel = useCarouselMode();

  return (
    <section className="explore" id="explore">
      <EditableText
        pageSlug="home"
        sectionKey="explore"
        blockKey="explore-label"
        fallback={label}
        className="section-label"
        as="div"
      />
      {isCarousel ? (
        <ExploreCarousel nav={nav} />
      ) : (
        <div className="cards-grid">
          {nav.map((item, i) => (
            <ExploreCard key={item.slug} item={item} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
