import type { SiteDocument } from "../types";
import { sortedCopy } from "../utils/immutable";

/** Compact site snapshot for the LLM — keeps token use reasonable */
export function buildSiteSnapshot(site: SiteDocument, currentPageSlug: string) {
  return {
    settings: site.settings,
    pages: site.pages.map((page) => ({
      slug: page.slug,
      title: page.title,
      isCurrent: page.slug === currentPageSlug,
      sections: sortedCopy(page.sections, (a, b) => a.sortOrder - b.sortOrder).map((section) => ({
          sectionKey: section.sectionKey,
          sectionType: section.sectionType,
          sortOrder: section.sortOrder,
          styles: section.styles,
          blocks: section.blocks.map((block) => ({
            blockKey: block.blockKey,
            blockType: block.blockType,
            value: block.value,
            styles: block.styles,
          })),
        })),
    })),
  };
}

export function pathToPageSlug(pathname: string): string {
  if (pathname === "/" || pathname === "") return "home";
  if (pathname.startsWith("/photos/")) return "photos";
  const slug = pathname.replace(/^\//, "").split("/")[0];
  return slug || "home";
}
