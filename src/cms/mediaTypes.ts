export type MediaKind = "image" | "video";
export type GalleryTileSize = "small" | "wide" | "tall" | "large";

export interface MediaItem {
  src: string;
  alt?: string;
  type?: MediaKind;
  zIndex?: number;
  tileSize?: GalleryTileSize;
}

export interface PhotoAlbum {
  slug: string;
  label: string;
  images?: MediaItem[];
}

export function mediaKindFromFile(file: File): MediaKind {
  if (file.type.startsWith("video/")) return "video";
  if (/\.(mp4|mov|webm|m4v|avi|mkv)$/i.test(file.name)) return "video";
  return "image";
}

export function isMediaFile(file: File): boolean {
  return (
    file.type.startsWith("image/") ||
    file.type.startsWith("video/") ||
    /\.(mp4|mov|webm|m4v|avi|mkv|jpe?g|png|gif|webp|heic)$/i.test(file.name)
  );
}

export const MEDIA_ACCEPT = "image/*,video/*,.mp4,.mov,.webm,.m4v";

export function normalizeMediaItem(raw: Partial<MediaItem> | string): MediaItem {
  if (typeof raw === "string") {
    return { src: raw, type: "image", zIndex: 0, tileSize: "small" };
  }
  return {
    src: raw.src ?? "",
    alt: raw.alt ?? "",
    type: raw.type ?? "image",
    zIndex: raw.zIndex ?? 0,
    tileSize: raw.tileSize ?? "small",
  };
}

export function sortByLayer(items: MediaItem[]): MediaItem[] {
  return [...items].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
}

export function bringForward(items: MediaItem[], index: number): MediaItem[] {
  const sorted = sortByLayer(items);
  const target = items[index];
  if (!target?.src) return items;
  const maxZ = Math.max(...items.map((i) => i.zIndex ?? 0), 0);
  return items.map((item, i) =>
    i === index ? { ...item, zIndex: maxZ + 1 } : item
  );
}

export function sendBackward(items: MediaItem[], index: number): MediaItem[] {
  const target = items[index];
  if (!target?.src) return items;
  const minZ = Math.min(...items.map((i) => i.zIndex ?? 0), 0);
  return items.map((item, i) =>
    i === index ? { ...item, zIndex: minZ - 1 } : item
  );
}
