import { OG_WIDTH, OG_HEIGHT, OG_DESCRIPTION } from "@/cms/utils/socialCard";

/**
 * Visual preview of the social share card. Renders the flattened 1200x630
 * og:image design (background photo) above an optional subtitle card on a
 * light background. The "You're invited" wording lives in the og:title meta
 * tag, not on the image.
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