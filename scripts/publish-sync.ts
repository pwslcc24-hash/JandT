/**
 * Sync defaultSite.ts content into Base44 SiteContent (what visitors see).
 * Run after the agent edits defaultSite.ts / pushes to main.
 *
 * Usage: cd slack-bot && npm run publish-sync
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createDefaultSiteDocument } from "../src/cms/seed/defaultSite.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
loadEnv(resolve(root, ".env.local"));
loadEnv(resolve(root, "slack-bot/.env"));

const APP_ID = process.env.VITE_BASE44_APP_ID;
const CLIENT_SLUG = process.env.VITE_CLIENT_SLUG || "holdsworth";
const SERVER_URL = process.env.VITE_BASE44_APP_BASE_URL || "https://base44.app";
const FETCH_TIMEOUT_MS = 30_000;

function loadEnv(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
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

async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchSiteContentRecord() {
  const q = encodeURIComponent(JSON.stringify({ clientSlug: CLIENT_SLUG }));
  const url = `${SERVER_URL}/api/apps/${APP_ID}/entities/SiteContent?q=${q}&sort=-updatedAt&limit=1`;
  const res = await fetchWithTimeout(url);
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`SiteContent fetch failed: HTTP ${res.status}`);
  }
  if (!Array.isArray(body) || !body[0]?.document) {
    throw new Error("No SiteContent on Base44.");
  }
  return body[0] as { id: string; document: { pages: Page[]; updatedAt?: string } };
}

async function updateSiteContentRecord(
  id: string,
  payload: { clientSlug: string; document: Record<string, unknown>; updatedAt: string }
) {
  const url = `${SERVER_URL}/api/apps/${APP_ID}/entities/SiteContent/${id}`;
  const res = await fetchWithTimeout(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`SiteContent update failed: HTTP ${res.status} ${text}`);
  }
}

async function main() {
  if (!APP_ID) {
    console.error("Missing VITE_BASE44_APP_ID");
    process.exit(1);
  }

  const record = await fetchSiteContentRecord();
  const doc = structuredClone(record.document);
  const defaults = createDefaultSiteDocument();

  for (const defPage of defaults.pages) {
    const pubPage = doc.pages.find((p) => p.slug === defPage.slug);
    if (!pubPage) continue;

    syncPageSection(pubPage, defPage as Page, "content");

    if (defPage.slug === "story") {
      syncPageSection(pubPage, defPage as Page, "media");
    }
  }

  await updateSiteContentRecord(record.id, {
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
