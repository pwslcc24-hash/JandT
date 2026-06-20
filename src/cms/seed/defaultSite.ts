import type { SiteDocument } from "../types";
import { DEFAULT_AGENDA_HTML } from "./agendaHtml";
import { DEFAULT_REGISTRY_HTML } from "./registryHtml";

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
              block("hero-video", "image", { url: "", mediaType: "video", alt: "Hero background" }),
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
                  {
                    slug: "photos",
                    label: "Photos",
                    icon: "photo",
                    mediaUrl:
                      "https://base44.app/api/apps/6a2b01575fdcdc3d21540f60/files/mp/public/6a2b01575fdcdc3d21540f60/b7eb8d0e3_1781906161340-TaylorJayden-118.jpeg",
                    mediaType: "image",
                  },
                  { slug: "registry", label: "Venmo/ Registry", icon: "gift" },
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
      pageContent("info", "Wedding Info", { html: DEFAULT_AGENDA_HTML }),
      pageContent("story", "Our Story", [
        "We met on a rainy afternoon in a tiny coffee shop. A shared umbrella and a long conversation later, something special had begun.",
        "Five years later, we're ready to say yes to forever — and we can't wait to celebrate with you.",
      ]),
      pageContent("registry", "Registry", { html: DEFAULT_REGISTRY_HTML }),
    ],
  };
}

function pageContent(
  slug: string,
  title: string,
  body: string[] | { html: string }
) {
  const html = Array.isArray(body)
    ? body.map((p) => `<p>${p}</p>`).join("")
    : body.html;
  const sections: SiteDocument["pages"][0]["sections"] = [
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
  ];

  if (slug === "story") {
    sections.push({
      id: "sec-story-media",
      sectionKey: "media",
      sectionType: "media-stack",
      sortOrder: 1,
      styles: {},
      stylesTablet: {},
      stylesMobile: {},
      // Keep story media empty by default so publish-sync clears any live story photo/video.
      blocks: [block("media-stack", "json", { items: [] })],
    });
  }

  return {
    id: `page-${slug}`,
    slug,
    title,
    sortOrder: slug === "info" ? 2 : slug === "story" ? 3 : 4,
    sections,
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
  if (b.value.data !== undefined) {
    const data = b.value.data as T;
    return data == null ? fallback : structuredClone(data);
  }
  return structuredClone(b.value as T);
}
