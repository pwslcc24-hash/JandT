import type { SiteSection } from "../types";

function block(
  blockKey: string,
  blockType: "text" | "rich_text" | "image" | "json",
  value: Record<string, unknown>,
  sortOrder = 0
) {
  return {
    id: `blk-${blockKey}-${crypto.randomUUID().slice(0, 8)}`,
    blockKey,
    blockType,
    value,
    styles: {},
    stylesTablet: {},
    stylesMobile: {},
    sortOrder,
  };
}

export function createSectionFromTemplate(
  template: "quote" | "text-box" | "callout" | "banner",
  sectionKey: string,
  sortOrder: number,
  content: Record<string, string> = {}
): SiteSection {
  const id = `sec-${sectionKey}`;

  if (template === "quote") {
    return {
      id,
      sectionKey,
      sectionType: "custom-quote",
      sortOrder,
      styles: { padding: "64px 24px", textAlign: "center" },
      stylesTablet: {},
      stylesMobile: {},
      blocks: [
        block("eyebrow", "text", { text: content.eyebrow ?? "Our favorite moment" }, 0),
        block("quote", "text", { text: content.quote ?? "Add your quote here." }, 1),
        block("attribution", "text", { text: content.attribution ?? "— Taylor & Jayden" }, 2),
      ],
    };
  }

  if (template === "text-box") {
    return {
      id,
      sectionKey,
      sectionType: "custom-text-box",
      sortOrder,
      styles: {
        padding: "48px 32px",
        margin: "24px",
        backgroundColor: "#f2f0ec",
        borderRadius: "16px",
      },
      stylesTablet: {},
      stylesMobile: {},
      blocks: [
        block("title", "text", { text: content.title ?? "Section title" }, 0),
        block(
          "body",
          "rich_text",
          { html: content.body ?? "<p>Write your content here.</p>" },
          1
        ),
      ],
    };
  }

  if (template === "callout") {
    return {
      id,
      sectionKey,
      sectionType: "custom-callout",
      sortOrder,
      styles: {
        padding: "40px 24px",
        textAlign: "center",
        backgroundColor: "#1a1a1a",
        color: "#ffffff",
      },
      stylesTablet: {},
      stylesMobile: {},
      blocks: [
        block("title", "text", { text: content.title ?? "Important note" }, 0),
        block("body", "text", { text: content.body ?? "Add details for your guests." }, 1),
      ],
    };
  }

  return {
    id,
    sectionKey,
    sectionType: "banner",
    sortOrder,
    styles: {},
    stylesTablet: {},
    stylesMobile: {},
    blocks: [
      block("banner-eyebrow", "text", { text: content.eyebrow ?? "Save the date" }, 0),
      block("banner-suffix", "text", { text: content.suffix ?? "until we celebrate" }, 1),
    ],
  };
}
