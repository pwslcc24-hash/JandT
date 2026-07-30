import {
  OG_WIDTH,
  OG_HEIGHT,
  OG_TITLE,
  OG_DESCRIPTION,
} from "@/cms/utils/socialCard";

/**
 * Visual preview of the social share card. Renders the flattened 1200x630
 * og:image design (background photo + bottom gradient + "You're invited"
 * title) above an optional subtitle card on a light background.
 *
 * This is the on-page preview only — the actual og:image PNG is produced by
 * renderOgImageToBlob() in src/cms/utils/socialCard.ts.
 */
export default function SocialShareCard({
  backgroundUrl,
  showSubtitle = true,
}) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 600,
        margin: "0 auto",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 10px 36px rgba(0,0,0,0.16)",
        background: "#fff",
      }}
    >
      {/* 1200x630 image area */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: `${OG_WIDTH} / ${OG_HEIGHT}`,
          backgroundImage: `url(${backgroundUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#1a1a1a",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 55%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: "9%",
            textAlign: "center",
            fontFamily: "'Times New Roman', Times, serif",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(22px, 6vw, 44px)",
            lineHeight: 1.1,
            color: "#fff",
            padding: "0 16px",
          }}
        >
          {OG_TITLE}
        </div>
      </div>

      {/* Subtitle card (lives below the image, outside the og:image) */}
      {showSubtitle && (
        <div
          style={{
            padding: "18px 22px",
            textAlign: "center",
            background: "#faf9f7",
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
              fontSize: 14,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "#6b6b6b",
            }}
          >
            {OG_DESCRIPTION}
          </span>
        </div>
      )}
    </div>
  );
}