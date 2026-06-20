import { getSupabase, isSupabaseConfigured, STORAGE_BUCKET } from "../supabase/client";
import type { SiteDocument, MediaAsset } from "../types";
import { createDefaultSiteDocument } from "../seed/defaultSite";
import { loadPublishedSiteDocument } from "./publish";
import {
  documentHasInlineMedia,
  externalizeInlineMedia,
  uploadBlobToBase44,
} from "./base44Media";
import { isBase44PublishAvailable } from "./publish";
import { cloneSiteDocument, touchSiteDocument } from "../utils/immutable";
import imageCompression from "browser-image-compression";

const LOCAL_DRAFT_KEY = "cms_site_draft";
const LOCAL_PUBLISHED_KEY = "cms_site_published";
const PUBLISHED_AT_KEY = "cms_published_at";
const LEGACY_LOCAL_KEY = "cms_site_document";
const CLIENT_SLUG = import.meta.env.VITE_CLIENT_SLUG || "holdsworth";

export interface LoadSiteOptions {
  preferDraft?: boolean;
}

export async function loadSiteDocument(options: LoadSiteOptions = {}): Promise<SiteDocument> {
  const defaults = createDefaultSiteDocument();
  migrateLegacyLocalStorage();

  const published = await loadPublishedSource();
  const draft = readLocalDraft();
  const publishedCached = isBase44PublishAvailable() ? null : readLocalPublished();
  const remotePublished = published ?? publishedCached;

  if (options.preferDraft && draft) {
    return cloneSiteDocument(mergeSiteDocument(draft, defaults));
  }

  if (remotePublished) {
    return cloneSiteDocument(mergeSiteDocument(remotePublished, defaults));
  }

  if (draft) {
    return cloneSiteDocument(mergeSiteDocument(draft, defaults));
  }

  return cloneSiteDocument(defaults);
}

async function loadPublishedSource(): Promise<SiteDocument | null> {
  // Base44 SiteContent is the visitor-facing source of truth.
  if (isBase44PublishAvailable()) {
    const fromBase44 = await loadPublishedSiteDocument();
    if (fromBase44) return fromBase44;
    // Avoid showing stale data from older stores when Base44 is expected.
    return null;
  }

  if (isSupabaseConfigured) {
    try {
      const fromDb = await loadFromSupabase();
      if (fromDb) return fromDb;
    } catch (err) {
      console.warn("[CMS] Failed to load published site from Supabase:", err);
    }
  }

  return null;
}

function migrateLegacyLocalStorage(): void {
  try {
    if (localStorage.getItem(LOCAL_DRAFT_KEY) || localStorage.getItem(LOCAL_PUBLISHED_KEY)) {
      return;
    }
    const legacy = localStorage.getItem(LEGACY_LOCAL_KEY);
    if (!legacy) return;
    if (localStorage.getItem(PUBLISHED_AT_KEY)) {
      localStorage.setItem(LOCAL_PUBLISHED_KEY, legacy);
    } else {
      localStorage.setItem(LOCAL_DRAFT_KEY, legacy);
    }
    localStorage.removeItem(LEGACY_LOCAL_KEY);
  } catch {
    /* ignore */
  }
}

function readLocalDraft(): SiteDocument | null {
  return readJsonKey(LOCAL_DRAFT_KEY);
}

function readLocalPublished(): SiteDocument | null {
  return readJsonKey(LOCAL_PUBLISHED_KEY);
}

function readJsonKey(key: string): SiteDocument | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as SiteDocument;
  } catch {
    return null;
  }
}

async function loadFromSupabase(): Promise<SiteDocument | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data: client } = await sb
    .from("clients")
    .select("id, slug, name, settings")
    .eq("slug", CLIENT_SLUG)
    .maybeSingle();

  if (!client) return null;

  const { data: pages } = await sb
    .from("pages")
    .select("id, slug, title, sort_order, sections(id, section_key, section_type, sort_order, styles, styles_tablet, styles_mobile, content_blocks(id, block_key, block_type, value, styles, styles_tablet, styles_mobile, sort_order))")
    .eq("client_id", client.id)
    .order("sort_order");

  if (!pages?.length) return null;

  return {
    clientId: client.id,
    clientSlug: client.slug,
    clientName: client.name,
    settings: client.settings ?? {},
    updatedAt: new Date().toISOString(),
    pages: pages.map(mapPage),
  };
}

function mapPage(p: Record<string, unknown>) {
  const sections = (p.sections as Record<string, unknown>[]) ?? [];
  return {
    id: p.id as string,
    slug: p.slug as string,
    title: p.title as string,
    sortOrder: p.sort_order as number,
    sections: [...sections]
      .sort((a, b) => (a.sort_order as number) - (b.sort_order as number))
      .map(mapSection),
  };
}

function mapSection(s: Record<string, unknown>) {
  const blocks = (s.content_blocks as Record<string, unknown>[]) ?? [];
  return {
    id: s.id as string,
    sectionKey: s.section_key as string,
    sectionType: s.section_type as string,
    sortOrder: s.sort_order as number,
    styles: (s.styles as Record<string, unknown>) ?? {},
    stylesTablet: (s.styles_tablet as Record<string, unknown>) ?? {},
    stylesMobile: (s.styles_mobile as Record<string, unknown>) ?? {},
    blocks: [...blocks]
      .sort((a, b) => (a.sort_order as number) - (b.sort_order as number))
      .map(mapBlock),
  };
}

function mapBlock(b: Record<string, unknown>) {
  return {
    id: b.id as string,
    blockKey: b.block_key as string,
    blockType: b.block_type as "text" | "rich_text" | "image" | "json",
    value: (b.value as Record<string, unknown>) ?? {},
    styles: (b.styles as Record<string, unknown>) ?? {},
    stylesTablet: (b.styles_tablet as Record<string, unknown>) ?? {},
    stylesMobile: (b.styles_mobile as Record<string, unknown>) ?? {},
    sortOrder: b.sort_order as number,
  };
}

/** Merge missing pages/sections/blocks from defaults into stored doc */
export function mergeSiteDocument(stored: SiteDocument, defaults: SiteDocument): SiteDocument {
  const base = cloneSiteDocument(stored);
  const mergedPages = base.pages.map((page) => {
    const defaultPage = defaults.pages.find((p) => p.slug === page.slug);
    if (!defaultPage) return page;

    const sectionKeys = new Set(page.sections.map((s) => s.sectionKey));
    const mergedSections = [...page.sections];
    for (const section of defaultPage.sections) {
      if (!sectionKeys.has(section.sectionKey)) {
        mergedSections.push(cloneSiteDocument(section));
        continue;
      }
      const existing = mergedSections.find((s) => s.sectionKey === section.sectionKey)!;
      const blockKeys = new Set(existing.blocks.map((b) => b.blockKey));
      for (const defaultBlock of section.blocks) {
        if (!blockKeys.has(defaultBlock.blockKey)) {
          existing.blocks = [...existing.blocks, cloneSiteDocument(defaultBlock)];
        }
      }
    }
    return { ...page, sections: mergedSections };
  });

  const pageSlugs = new Set(base.pages.map((p) => p.slug));
  for (const page of defaults.pages) {
    if (!pageSlugs.has(page.slug)) mergedPages.push(cloneSiteDocument(page));
  }

  return { ...base, pages: mergedPages };
}

export async function saveLocalDraft(doc: SiteDocument): Promise<void> {
  let snapshot = touchSiteDocument(doc);
  try {
    localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(snapshot));
    return;
  } catch {
    if (!isBase44PublishAvailable() || !documentHasInlineMedia(snapshot)) {
      throw new Error(
        "Draft is too large to save locally. Use smaller images/videos or click Save Live."
      );
    }
  }

  snapshot = touchSiteDocument(await externalizeInlineMedia(snapshot));
  localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(snapshot));
}

export async function publishSiteDocument(doc: SiteDocument): Promise<SiteDocument> {
  let working = cloneSiteDocument(doc);
  if (documentHasInlineMedia(working)) {
    working = await externalizeInlineMedia(working);
  }

  const snapshot = touchSiteDocument(working);

  const { publishSiteToBase44 } = await import("./publish");
  await publishSiteToBase44(snapshot);

  if (isSupabaseConfigured) {
    await saveToSupabase(snapshot);
  }

  try {
    localStorage.setItem(LOCAL_PUBLISHED_KEY, JSON.stringify(snapshot));
    localStorage.setItem(PUBLISHED_AT_KEY, snapshot.updatedAt);
    localStorage.removeItem(LOCAL_DRAFT_KEY);
  } catch {
    // Published remotely even if local cache fails.
  }

  return snapshot;
}

/** @deprecated Use saveLocalDraft for autosave or publishSiteDocument for live saves */
export async function saveSiteDocument(doc: SiteDocument): Promise<void> {
  await saveLocalDraft(doc);
}

async function saveToSupabase(doc: SiteDocument): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  for (const page of doc.pages) {
    for (const section of page.sections) {
      await sb.from("sections").upsert({
        id: section.id,
        page_id: page.id,
        section_key: section.sectionKey,
        section_type: section.sectionType,
        sort_order: section.sortOrder,
        styles: section.styles,
        styles_tablet: section.stylesTablet,
        styles_mobile: section.stylesMobile,
      });

      for (const block of section.blocks) {
        await sb.from("content_blocks").upsert({
          id: block.id,
          section_id: section.id,
          block_key: block.blockKey,
          block_type: block.blockType,
          value: block.value,
          styles: block.styles,
          styles_tablet: block.stylesTablet,
          styles_mobile: block.stylesMobile,
          sort_order: block.sortOrder,
        });
      }
    }
  }

  await sb.from("content_revisions").insert({
    client_id: doc.clientId,
    snapshot: doc,
    label: "Auto-save",
  });
}

export async function uploadMedia(
  file: File,
  clientId: string
): Promise<MediaAsset> {
  const isVideo = file.type.startsWith("video/") || /\.(mp4|mov|webm|m4v|avi|mkv)$/i.test(file.name);
  const isPsd = file.type === "image/vnd.adobe.photoshop" || /\.psd$/i.test(file.name);
  const uploadBlob = isVideo || isPsd
    ? file
    : await imageCompression(file, {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 2400,
        useWebWorker: true,
      });

  if (!isSupabaseConfigured && isVideo && uploadBlob.size > 15 * 1024 * 1024) {
    throw new Error("Video is too large for local save (max 15MB). Use a shorter clip or compress it.");
  }

  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const storagePath = `${CLIENT_SLUG}/${fileName}`;

  if (isSupabaseConfigured) {
    const sb = getSupabase()!;
    const { error } = await sb.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, uploadBlob, {
        upsert: true,
        contentType: file.type || undefined,
      });
    if (error) throw error;

    const { data: urlData } = sb.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

    const asset: MediaAsset = {
      id: crypto.randomUUID(),
      publicUrl: urlData.publicUrl,
      storagePath,
      fileName: file.name,
      altText: "",
      sizeBytes: uploadBlob.size,
    };

    await sb.from("media_assets").insert({
      id: asset.id,
      client_id: clientId,
      storage_path: storagePath,
      public_url: asset.publicUrl,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: uploadBlob.size,
    });

    return asset;
  }

  if (isBase44PublishAvailable()) {
    const mimeType = file.type || uploadBlob.type || "application/octet-stream";
    const publicUrl = await uploadBlobToBase44(uploadBlob, fileName, mimeType);
    return {
      id: crypto.randomUUID(),
      publicUrl,
      storagePath,
      fileName: file.name,
      altText: "",
      sizeBytes: uploadBlob.size,
    };
  }

  const dataUrl = await blobToDataUrl(uploadBlob);
  return {
    id: crypto.randomUUID(),
    publicUrl: dataUrl,
    storagePath,
    fileName: file.name,
    altText: "",
    sizeBytes: uploadBlob.size,
  };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function listMedia(clientId: string): Promise<MediaAsset[]> {
  if (!isSupabaseConfigured) return [];
  const sb = getSupabase()!;
  const { data } = await sb
    .from("media_assets")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((m) => ({
    id: m.id,
    publicUrl: m.public_url,
    storagePath: m.storage_path,
    fileName: m.file_name ?? "",
    altText: m.alt_text ?? "",
    width: m.width,
    height: m.height,
    sizeBytes: m.size_bytes,
  }));
}