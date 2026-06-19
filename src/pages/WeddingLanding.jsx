import { useState } from "react";
import { motion } from "framer-motion";
import { useCountdown } from "@/hooks/useCountdown";
import { WeddingIcon } from "@/components/wedding/icons";
import SideMenu from "@/components/wedding/SideMenu";
import ExploreSection from "@/components/wedding/ExploreSection";
import EditableText from "@/components/editor/EditableText";
import EditableMedia from "@/components/editor/EditableMedia";
import EditableGenericSection from "@/components/editor/EditableGenericSection";
import { EditableSectionList } from "@/components/editor/EditableSection";
import { useSiteContent } from "@/cms/hooks/useSiteContent";
import { useEditor } from "@/cms/context/EditorContext";
import { cn } from "@/lib/utils";

export default function WeddingLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { editMode, isAdmin } = useEditor();
  const { couple, date, videoUrl, nav, banner, exploreLabel, sectionOrder, getSectionKey } =
    useSiteContent();
  const days = useCountdown(date.iso);

  const renderSection = (sectionId, sectionKey) => {
    if (sectionKey === "hero") return renderHero();
    if (sectionKey === "explore") return renderExplore();
    if (sectionKey === "banner") return renderBanner();
    return (
      <EditableGenericSection
        key={sectionId}
        pageSlug="home"
        sectionKey={sectionKey}
        variant="landing"
      />
    );
  };

  const renderHero = () => (
    <div className={cn("hero", editMode && isAdmin && "hero--editing")}>
      <EditableMedia
        pageSlug="home"
        sectionKey="hero"
        blockKey="hero-video"
        fallbackUrl={videoUrl}
        fallbackType="video"
        className="hero-media-wrap"
        mediaClassName="video-bg-media"
        variant="background"
      >
        <div className="video-bg">
          <WeddingIcon name="play" className="video-bg-icon" />
          <span>Tap to add hero photo or video</span>
        </div>
      </EditableMedia>

      <div className="video-overlay" />

      <motion.div
        className="hero-title-block"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="hero-names">
          <EditableText
            pageSlug="home"
            sectionKey="hero"
            blockKey="hero-names"
            fallback={couple.names}
            className="name-row"
            as="div"
          />
          <EditableText
            pageSlug="home"
            sectionKey="hero"
            blockKey="hero-lastname"
            fallback={couple.lastName}
            className="name-last"
            as="div"
          />
        </div>
        <EditableText
          pageSlug="home"
          sectionKey="hero"
          blockKey="hero-date"
          fallback={date.display}
          className="hero-date"
          as="div"
        />
        <div className="hero-countdown">
          <motion.span
            key={days}
            className="num"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {days}
          </motion.span>
          <span className="lbl">days to go</span>
        </div>
      </motion.div>

      <button
        type="button"
        className="menu-toggle"
        aria-label="Open menu"
        onClick={() => setMenuOpen(true)}
      >
        <WeddingIcon name="menu" className="menu-toggle-icon" />
      </button>

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );

  const renderExplore = () => (
    <ExploreSection nav={nav} label={exploreLabel} />
  );

  const renderBanner = () => (
    <motion.section
      className="banner"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <EditableText
        pageSlug="home"
        sectionKey="banner"
        blockKey="banner-eyebrow"
        fallback={banner.eyebrow}
        className="banner-eyebrow"
        as="div"
      />
      <motion.div
        key={days}
        className="banner-big"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        {days}
      </motion.div>
      <div className="banner-sub">
        {banner.suffix} · {date.display}
      </div>
    </motion.section>
  );

  const ids = sectionOrder.length
    ? sectionOrder
    : ["sec-hero", "sec-explore", "sec-banner"];

  return (
    <div className="page">
      <EditableSectionList
        pageSlug="home"
        sectionIds={ids}
        getSectionKey={(id) => getSectionKey(id) || ({ "sec-hero": "hero", "sec-explore": "explore", "sec-banner": "banner" }[id] ?? "")}
        renderSection={renderSection}
      />
    </div>
  );
}
