/**
 * Sync defaultSite.ts content into Base44 SiteContent (what visitors see).
 * Run after the agent edits defaultSite.ts / pushes to main.
 *
 * Usage: cd slack-bot && npm run publish-sync
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@base44/sdk";
import { createDefaultSiteDocument } from "../src/cms/seed/defaultSite.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
loadEnv(resolve(root, ".env.local"));
loadEnv(resolve(root, "slack-bot/.env"));

const APP_ID = process.env.VITE_BASE44_APP_ID;
const CLIENT_SLUG = process.env.VITE_CLIENT_SLUG || "holdsworth";

function loadEnv(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

function unwrapRecords(result: unknown): Array<{ id: string; document: Record<string, unknown> }> {
  if (Array.isArray(result)) return result as Array<{ id: string; document: Record<string, unknown> }>;
  const obj = result as Record<string, unknown>;
  if (Array.isArray(obj?.data)) return obj.data as Array<{ id: string; document: Record<string, unknown> }>;
  if (Array.isArray(obj?.items)) return obj.items as Array<{ id: string; document: Record<string, unknown> }>;
  return [];
}

type Block = { blockKey: string; value?: Record<string, unknown> };
type Section = { sectionKey: string; blocks: Block[] };
type Page = { slug: string; sections: Section[] };

function syncPageSection(published: Page, defaults: Page, sectionKey: string) {
  const defSection = defaults.sections.find((s) => s.sectionKey === sectionKey);
  const pubSection = published.sections.find((s) => s.sectionKey === sectionKey);
  if (!defSection || !pubSection) return;

  for (const defBlock of defSection.blocks) {
    const pubBlock = pubSection.blocks.find((b) => b.blockKey === defBlock.blockKey);
    if (pubBlock && defBlock.value) {
      pubBlock.value = structuredClone(defBlock.value);
    }
  }
}

async function main() {
  if (!APP_ID) {
    console.error("Missing VITE_BASE44_APP_ID");
    process.exit(1);
  }

  const base44 = createClient({
    appId: APP_ID,
    serverUrl: "https://base44.app",
    requiresAuth: false,
  });

  const result = await base44.entities.SiteContent.filter(
    { clientSlug: CLIENT_SLUG },
    "-updatedAt",
    1
  );
  const records = unwrapRecords(result);
  if (!records[0]?.document) {
    console.error("No SiteContent on Base44.");
    process.exit(1);
  }

  const doc = structuredClone(records[0].document) as { pages: Page[]; updatedAt?: string };
  const defaults = createDefaultSiteDocument();

  for (const defPage of defaults.pages) {
    const pubPage = doc.pages.find((p) => p.slug === defPage.slug);
    if (!pubPage) continue;

    syncPageSection(pubPage, defPage as Page, "content");

    if (defPage.slug === "story") {
      syncPageSection(pubPage, defPage as Page, "media");
    }
  }

  await base44.entities.SiteContent.update(records[0].id, {
    clientSlug: CLIENT_SLUG,
    document: { ...doc, updatedAt: new Date().toISOString() },
    updatedAt: new Date().toISOString(),
  });

  console.log("Synced defaultSite content → Base44 SiteContent (live visitors).");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
