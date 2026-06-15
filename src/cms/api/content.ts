import { getSupabase, isSupabaseConfigured, STORAGE_BUCKET } from "../supabase/client";
import type { SiteDocument, MediaAsset } from "../types";
import { createDefaultSiteDocument } from "../seed/defaultSite";
import imageCompression from "browser-image-compression";

const LOCAL_KEY = "cms_site_document";
const CLIENT_SLUG = import.meta.env.VITE_CLIENT_SLUG || "holdsworth";

export async function loadSiteDocument(): Promise<SiteDocument> {
  if (isSupabaseConfigured) {
    const doc = await loadFromSupabase();
    if (doc) return doc;
  }
  return loadFromLocal();
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
    sections: sections
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
    blocks: blocks
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

function loadFromLocal(): SiteDocument {
  const defaults = createDefaultSiteDocument();
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as SiteDocument;
      return mergeSiteDocument(stored, defaults);
    }
  } catch {
    /* use default */
  }
  localStorage.setItem(LOCAL_KEY, JSON.stringify(defaults));
  return defaults;
}

/** Merge missing pages/sections from defaults into stored doc */
function mergeSiteDocument(stored: SiteDocument, defaults: SiteDocument): SiteDocument {
  const pageSlugs = new Set(stored.pages.map((p) => p.slug));
  const mergedPages = [...stored.pages];
  for (const page of defaults.pages) {
    if (!pageSlugs.has(page.slug)) mergedPages.push(page);
  }
  return { ...stored, pages: mergedPages };
}

export async function saveSiteDocument(doc: SiteDocument): Promise<void> {
  doc.updatedAt = new Date().toISOString();
  localStorage.setItem(LOCAL_KEY, JSON.stringify(doc));

  if (!isSupabaseConfigured) return;
  await saveToSupabase(doc);
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
  const compressed = await imageCompression(file, {
    maxSizeMB: 1.5,
    maxWidthOrHeight: 2400,
    useWebWorker: true,
  });

  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const storagePath = `${CLIENT_SLUG}/${fileName}`;

  if (isSupabaseConfigured) {
    const sb = getSupabase()!;
    const { error } = await sb.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, compressed, { upsert: true });
    if (error) throw error;

    const { data: urlData } = sb.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

    const asset: MediaAsset = {
      id: crypto.randomUUID(),
      publicUrl: urlData.publicUrl,
      storagePath,
      fileName: file.name,
      altText: "",
      sizeBytes: compressed.size,
    };

    await sb.from("media_assets").insert({
      id: asset.id,
      client_id: clientId,
      storage_path: storagePath,
      public_url: asset.publicUrl,
      file_name: file.name,
      mime_type: compressed.type,
      size_bytes: compressed.size,
    });

    return asset;
  }

  // Local fallback: data URL
  const dataUrl = await blobToDataUrl(compressed);
  return {
    id: crypto.randomUUID(),
    publicUrl: dataUrl,
    storagePath,
    fileName: file.name,
    altText: "",
    sizeBytes: compressed.size,
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
