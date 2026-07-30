import { base44 } from "@/api/base44Client";
import { appParams } from "@/lib/app-params";
import type { SiteDocument } from "../types";
import { createDefaultSiteDocument } from "../seed/defaultSite";
import { mergeSiteDocument } from "./content";
import { cloneSiteDocument, touchSiteDocument } from "../utils/immutable";

const CLIENT_SLUG = import.meta.env.VITE_CLIENT_SLUG || "holdsworth";

interface SiteContentRecord {
  id: string;
  clientSlug: string;
  document: SiteDocument;
  draft?: SiteDocument | null;
  updatedAt?: string;
}

export function isBase44PublishAvailable(): boolean {
  return Boolean(appParams.appId);
}

function unwrapRecords(result: unknown): SiteContentRecord[] {
  if (Array.isArray(result)) return result as SiteContentRecord[];
  if (result && typeof result === "object") {
    const obj = result as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as SiteContentRecord[];
    if (Array.isArray(obj.items)) return obj.items as SiteContentRecord[];
  }
  return [];
}

export async function loadPublishedSiteDocument(): Promise<SiteDocument | null> {
  if (!isBase44PublishAvailable()) return null;

  try {
    const result = await base44.entities.SiteContent.filter(
      { clientSlug: CLIENT_SLUG },
      "-updatedAt",
      1
    );

    const records = unwrapRecords(result);
    const record = records[0];
    if (!record?.document) return null;

    return mergeSiteDocument(cloneSiteDocument(record.document), createDefaultSiteDocument());
  } catch (err) {
    console.warn("[CMS] Failed to load published site from Base44:", err);
    return null;
  }
}

/**
 * Loads the latest autosaved draft from Base44. Drafts are separate from the
 * published `document` so unsaved edits survive a page refresh even when the
 * browser's localStorage has been cleared.
 */
export async function loadDraftSiteDocument(): Promise<SiteDocument | null> {
  if (!isBase44PublishAvailable()) return null;

  try {
    const result = await base44.entities.SiteContent.filter(
      { clientSlug: CLIENT_SLUG },
      "-updatedAt",
      1
    );

    const records = unwrapRecords(result);
    const record = records[0];
    if (!record?.draft) return null;

    return mergeSiteDocument(cloneSiteDocument(record.draft), createDefaultSiteDocument());
  } catch (err) {
    console.warn("[CMS] Failed to load draft from Base44:", err);
    return null;
  }
}

async function findSiteContentRecord(): Promise<SiteContentRecord | null> {
  if (!isBase44PublishAvailable()) return null;
  const result = await base44.entities.SiteContent.filter(
    { clientSlug: CLIENT_SLUG },
    "-updatedAt",
    10
  );
  const existing = unwrapRecords(result);
  return existing[0] ?? null;
}

/** Persists the editor draft to Base44 so it survives refresh. Best-effort. */
export async function saveDraftToBase44(doc: SiteDocument): Promise<void> {
  if (!isBase44PublishAvailable()) return;

  try {
    const payload = { draft: touchSiteDocument(doc) };
    const existing = await findSiteContentRecord();
    if (!existing?.id) return; // nothing to attach a draft to until first publish
    await base44.entities.SiteContent.update(existing.id, payload);
  } catch (err) {
    console.warn("[CMS] Failed to save draft to Base44:", err);
  }
}

export async function publishSiteToBase44(doc: SiteDocument): Promise<void> {
  if (!isBase44PublishAvailable()) {
    throw new Error("Base44 is not configured. Set VITE_BASE44_APP_ID in .env.local.");
  }

  const payload = {
    clientSlug: doc.clientSlug || CLIENT_SLUG,
    document: touchSiteDocument(doc),
    updatedAt: new Date().toISOString(),
  };

  try {
    const existingResult = await base44.entities.SiteContent.filter(
      { clientSlug: payload.clientSlug },
      "-updatedAt",
      10
    );
    const existing = unwrapRecords(existingResult);

    if (existing.length > 0) {
      // Clear the draft — the published document now reflects the latest edits.
      await base44.entities.SiteContent.update(existing[0].id, { ...payload, draft: null });
      for (let i = 1; i < existing.length; i++) {
        try {
          await base44.entities.SiteContent.delete(existing[i].id);
        } catch {
          /* best effort */
        }
      }
      return;
    }

    await base44.entities.SiteContent.create(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/quota|too large|payload|limit/i.test(message)) {
      throw new Error(
        "Save failed — site content is too large. Try smaller photos/videos, then Save Live again."
      );
    }
    if (message.includes("not found") || message.includes("SiteContent")) {
      throw new Error(
        "Live save is not ready yet. Push to GitHub and Publish on Base44.com to register the SiteContent entity, then try again."
      );
    }
    throw err instanceof Error ? err : new Error("Failed to publish site content.");
  }
}