import { useEditor } from "@/cms/context/EditorContext";
import { getText, getJson } from "@/cms/seed/defaultSite";
import { wedding } from "@/config/wedding";
import type { PhotoAlbum } from "@/components/wedding/PhotoAlbumList";

/** Read content from CMS document with wedding.js fallback */
export function useSiteContent() {
  const { site } = useEditor();

  const couple = {
    names: site
      ? getText(site, "home", "hero", "hero-names", wedding.couple.names)
      : wedding.couple.names,
    lastName: site
      ? getText(site, "home", "hero", "hero-lastname", wedding.couple.lastName)
      : wedding.couple.lastName,
  };

  const date = {
    iso: String(site?.settings?.weddingDate ?? wedding.date.iso),
    display: site
      ? getText(site, "home", "hero", "hero-date", wedding.date.display)
      : wedding.date.display,
  };

  const videoUrl = site
    ? String(
        site.pages
          .find((p) => p.slug === "home")
          ?.sections.find((s) => s.sectionKey === "hero")
          ?.blocks.find((b) => b.blockKey === "hero-video")?.value?.url ?? ""
      ) || wedding.videoUrl
    : wedding.videoUrl;

  const nav = site
    ? getJson<{ items: typeof wedding.nav }>(site, "home", "explore", "explore-cards", {
        items: wedding.nav,
      }).items
    : wedding.nav;

  const banner = {
    eyebrow: site
      ? getText(site, "home", "banner", "banner-eyebrow", wedding.banner.eyebrow)
      : wedding.banner.eyebrow,
    suffix: site
      ? getText(site, "home", "banner", "banner-suffix", wedding.banner.suffix)
      : wedding.banner.suffix,
  };

  const exploreLabel = site
    ? getText(site, "home", "explore", "explore-label", "Explore")
    : "Explore";

  const homeSections = site?.pages.find((p) => p.slug === "home")?.sections ?? [];
  const sectionOrder = [...homeSections]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((s) => s.id);
  const getSectionKey = (id: string) =>
    homeSections.find((s) => s.id === id)?.sectionKey ?? "";

  return {
    couple,
    date,
    videoUrl,
    nav,
    banner,
    exploreLabel,
    sectionOrder,
    getSectionKey,
    homeSections,
  };
}

export function usePhotoAlbums(): PhotoAlbum[] {
  const { site } = useEditor();
  const fallback = wedding.photoAlbums.map((a) => ({
    slug: a.slug,
    label: a.label,
    images: a.images ?? [],
  }));

  if (!site) return fallback;

  const items = getJson<{ items: PhotoAlbum[] }>(
    site,
    "photos",
    "photo-albums",
    "photo-albums",
    { items: fallback }
  ).items;

  return items?.length ? items : fallback;
}

export function usePhotoAlbum(slug: string): PhotoAlbum | null {
  const albums = usePhotoAlbums();
  return albums.find((a) => a.slug === slug) ?? null;
}

export function usePageContent(pageSlug: string) {
  const { site } = useEditor();
  const navItem = wedding.nav.find((n) => n.slug === pageSlug);

  const cmsPage = site?.pages.find((p) => p.slug === pageSlug);
  const section = cmsPage?.sections.find((s) => s.sectionKey === "content");

  const title = section
    ? getText(site!, pageSlug, "content", "title", navItem?.title ?? "")
    : navItem?.title ?? "";

  const bodyHtml = section
    ? String(
        site!.pages
          .find((p) => p.slug === pageSlug)
          ?.sections.find((s) => s.sectionKey === "content")
          ?.blocks.find((b) => b.blockKey === "body")?.value?.html ?? ""
      )
    : "";

  const fallbackHtml =
    navItem?.body?.map((p) => `<p>${p}</p>`).join("") ?? "<p></p>";

  return {
    title,
    bodyHtml: bodyHtml || fallbackHtml,
    hasCmsPage: Boolean(cmsPage),
  };
}
