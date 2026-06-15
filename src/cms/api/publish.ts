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
  updatedAt?: string;
}

export function isBase44PublishAvailable(): boolean {
  return Boolean(appParams.appId);
}

export async function loadPublishedSiteDocument(): Promise<SiteDocument | null> {
  if (!isBase44PublishAvailable()) return null;

  try {
    const records = (await base44.entities.SiteContent.filter(
      { clientSlug: CLIENT_SLUG },
      "-updatedAt",
      1
    )) as SiteContentRecord[];

    const record = records?.[0];
    if (!record?.document) return null;

    return mergeSiteDocument(cloneSiteDocument(record.document), createDefaultSiteDocument());
  } catch {
    return null;
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
    const existing = (await base44.entities.SiteContent.filter(
      { clientSlug: payload.clientSlug },
      "-updatedAt",
      1
    )) as SiteContentRecord[];

    if (existing?.[0]?.id) {
      await base44.entities.SiteContent.update(existing[0].id, payload);
      return;
    }

    await base44.entities.SiteContent.create(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("not found") || message.includes("SiteContent")) {
      throw new Error(
        "Live save is not ready yet. Push to GitHub and Publish on Base44.com to register the SiteContent entity, then try again."
      );
    }
    throw err instanceof Error ? err : new Error("Failed to publish site content.");
  }
}
