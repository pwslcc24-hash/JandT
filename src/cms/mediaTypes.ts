export type MediaKind = "image" | "video";

export interface MediaItem {
  src: string;
  alt?: string;
  type?: MediaKind;
  zIndex?: number;
}

export interface PhotoAlbum {
  slug: string;
  label: string;
  images?: MediaItem[];
}

export function mediaKindFromFile(file: File): MediaKind {
  return file.type.startsWith("video/") ? "video" : "image";
}

export function normalizeMediaItem(raw: Partial<MediaItem> | string): MediaItem {
  if (typeof raw === "string") {
    return { src: raw, type: "image", zIndex: 0 };
  }
  return {
    src: raw.src ?? "",
    alt: raw.alt ?? "",
    type: raw.type ?? "image",
    zIndex: raw.zIndex ?? 0,
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
