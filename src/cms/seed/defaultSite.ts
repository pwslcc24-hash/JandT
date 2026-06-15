import type { SiteDocument } from "./types";

/** Default site content — seeded to DB / localStorage on first load */
export function createDefaultSiteDocument(): SiteDocument {
  const now = new Date().toISOString();
  const clientId = "local-holdsworth";

  return {
    clientId,
    clientSlug: "holdsworth",
    clientName: "Holdsworth Wedding",
    updatedAt: now,
    settings: {
      weddingDate: "2026-08-05T00:00:00",
      weddingDateDisplay: "August 5, 2026",
      videoUrl: "",
    },
    pages: [
      {
        id: "page-home",
        slug: "home",
        title: "Home",
        sortOrder: 0,
        sections: [
          {
            id: "sec-hero",
            sectionKey: "hero",
            sectionType: "hero",
            sortOrder: 0,
            styles: {},
            stylesTablet: {},
            stylesMobile: {},
            blocks: [
              block("hero-names", "text", { text: "Taylor & Jayden" }),
              block("hero-lastname", "text", { text: "Holdsworth" }),
              block("hero-date", "text", { text: "August 5, 2026" }),
              block("hero-video", "image", { url: "", alt: "Hero background" }),
            ],
          },
          {
            id: "sec-explore",
            sectionKey: "explore",
            sectionType: "explore",
            sortOrder: 1,
            styles: {},
            stylesTablet: {},
            stylesMobile: {},
            blocks: [
              block("explore-label", "text", { text: "Explore" }),
              block("explore-cards", "json", {
                items: [
                  { slug: "info", label: "Info", icon: "calendar" },
                  { slug: "story", label: "Our story", icon: "heart" },
                  { slug: "photos", label: "Photos", icon: "photo" },
                  { slug: "registry", label: "Registry", icon: "gift" },
                ],
              }),
            ],
          },
          {
            id: "sec-banner",
            sectionKey: "banner",
            sectionType: "banner",
            sortOrder: 2,
            styles: {},
            stylesTablet: {},
            stylesMobile: {},
            blocks: [
              block("banner-eyebrow", "text", { text: "See you in" }),
              block("banner-suffix", "text", { text: "days" }),
            ],
          },
        ],
      },
      {
        id: "page-photos",
        slug: "photos",
        title: "Photos",
        sortOrder: 1,
        sections: [
          {
            id: "sec-photo-albums",
            sectionKey: "photo-albums",
            sectionType: "photo-albums",
            sortOrder: 0,
            styles: {},
            stylesTablet: {},
            stylesMobile: {},
            blocks: [
              block("photos-title", "text", { text: "Photos" }),
              block("photo-albums", "json", {
                items: [
                  { slug: "engagement", label: "Engagement", images: [] },
                  { slug: "bridals", label: "Bridals", images: [] },
                  { slug: "templo", label: "Templo", images: [] },
                  { slug: "ring-ceremony", label: "Ring Ceremony", images: [] },
                  { slug: "luncheon", label: "Luncheon", images: [] },
                  { slug: "reception", label: "Reception", images: [] },
                  { slug: "wedding-video", label: "Wedding Video", images: [] },
                ],
              }),
            ],
          },
        ],
      },
      pageContent("info", "Wedding Info", [
        "Ceremony — 4:00 PM · St. Mary's Chapel",
        "Reception — 6:00 PM · The Grand Estate",
        "Dress code — Cocktail attire",
        "RSVP by July 1, 2026",
      ]),
      pageContent("story", "Our Story", [
        "We met on a rainy afternoon in a tiny coffee shop. A shared umbrella and a long conversation later, something special had begun.",
        "Five years later, we're ready to say yes to forever — and we can't wait to celebrate with you.",
      ]),
      pageContent("registry", "Registry", [
        "Your presence is the greatest gift.",
        "Registry links can be added in the admin content manager.",
      ]),
    ],
  };
}

function pageContent(slug: string, title: string, paragraphs: string[]) {
  const html = paragraphs.map((p) => `<p>${p}</p>`).join("");
  return {
    id: `page-${slug}`,
    slug,
    title,
    sortOrder: slug === "info" ? 2 : slug === "story" ? 3 : 4,
    sections: [
      {
        id: `sec-${slug}-content`,
        sectionKey: "content",
        sectionType: "content",
        sortOrder: 0,
        styles: {},
        stylesTablet: {},
        stylesMobile: {},
        blocks: [
          block("title", "text", { text: title }),
          block("body", "rich_text", { html }),
        ],
      },
    ],
  };
}

function block(
  blockKey: string,
  blockType: "text" | "rich_text" | "image" | "json",
  value: Record<string, unknown>
) {
  return {
    id: `blk-${blockKey}`,
    blockKey,
    blockType,
    value,
    styles: {},
    stylesTablet: {},
    stylesMobile: {},
    sortOrder: 0,
  };
}

/** Resolve a block value by dot path: home.hero.hero-names */
export function getBlockValue(
  doc: SiteDocument,
  pageSlug: string,
  sectionKey: string,
  blockKey: string
): ContentBlockLike | null {
  const page = doc.pages.find((p) => p.slug === pageSlug);
  const section = page?.sections.find((s) => s.sectionKey === sectionKey);
  const block = section?.blocks.find((b) => b.blockKey === blockKey);
  return block ?? null;
}

type ContentBlockLike = SiteDocument["pages"][0]["sections"][0]["blocks"][0];

export function getText(
  doc: SiteDocument,
  pageSlug: string,
  sectionKey: string,
  blockKey: string,
  fallback = ""
): string {
  const b = getBlockValue(doc, pageSlug, sectionKey, blockKey);
  if (!b) return fallback;
  return String(b.value?.text ?? fallback);
}

export function getJson<T>(
  doc: SiteDocument,
  pageSlug: string,
  sectionKey: string,
  blockKey: string,
  fallback: T
): T {
  const b = getBlockValue(doc, pageSlug, sectionKey, blockKey);
  if (!b?.value) return fallback;
  const v = b.value.data ?? b.value.items ?? b.value;
  return (v as T) ?? fallback;
}
