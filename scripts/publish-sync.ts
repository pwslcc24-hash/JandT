/**
 * Sync defaultSite.ts content into Base44 SiteContent (what visitors see).
 * Run after the agent edits defaultSite.ts / pushes to main.
 *
 * Usage: cd slack-bot && npm run publish-sync
 */
import { readFileSync, existsSync, appendFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createDefaultSiteDocument } from "../src/cms/seed/defaultSite.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
loadEnv(resolve(root, ".env.local"));
loadEnv(resolve(root, "slack-bot/.env"));

const APP_ID = process.env.VITE_BASE44_APP_ID;
const CLIENT_SLUG = process.env.VITE_CLIENT_SLUG || "holdsworth";
const SERVER_URL = process.env.VITE_BASE44_APP_BASE_URL || "https://base44.app";
const DEBUG_LOG = resolve(root, ".cursor/debug-eed66c.log");
const FETCH_TIMEOUT_MS = 30_000;

function loadEnv(path: string) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

// #region agent log
function debugLog(
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown> = {}
) {
  const payload = {
    sessionId: "eed66c",
    runId: process.env.GITHUB_RUN_ID || "local",
    hypothesisId,
    location,
    message,
    data,
    timestamp: Date.now(),
  };
  try {
    appendFileSync(DEBUG_LOG, `${JSON.stringify(payload)}\n`);
  } catch {
    /* ignore */
  }
  fetch("http://127.0.0.1:7412/ingest/79848e7e-e39c-4dd3-91b6-e0e49c59bb34", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "eed66c" },
    body: JSON.stringify(payload),
  }).catch(() => {});
}
// #endregion

type Block = { blockKey: string; value?: Record<string, unknown> };
type Section = { sectionKey: string; blocks: Block[] };
type Page = { slug: string; sections: Section[] };

function syncPageSection(published: Page, defaults: Page, sectionKey: string) {
  const defSection = defaults.sections.find((s) => s.sectionKey === sectionKey);
  const pubSection = published.sections.find((s) => s.sectionKey === sectionKey);
  if (!defSection || !pubSection) return false;

  for (const defBlock of defSection.blocks) {
    const pubBlock = pubSection.blocks.find((b) => b.blockKey === defBlock.blockKey);
    if (pubBlock && defBlock.value) {
      pubBlock.value = structuredClone(defBlock.value);
    }
  }
  return true;
}

function storyMediaCount(doc: { pages: Page[] }) {
  const story = doc.pages.find((p) => p.slug === "story");
  const media = story?.sections.find((s) => s.sectionKey === "media");
  const stack = media?.blocks.find((b) => b.blockKey === "media-stack");
  const items = stack?.value?.items;
  return Array.isArray(items) ? items.length : -1;
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
  // #region agent log
  debugLog("A", "publish-sync.ts:fetchSiteContentRecord", "fetch start", { url });
  // #endregion
  const started = Date.now();
  const res = await fetchWithTimeout(url);
  const body = await res.json();
  // #region agent log
  debugLog("A", "publish-sync.ts:fetchSiteContentRecord", "fetch done", {
    status: res.status,
    ms: Date.now() - started,
    recordCount: Array.isArray(body) ? body.length : 0,
  });
  // #endregion
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
  // #region agent log
  debugLog("A", "publish-sync.ts:updateSiteContentRecord", "update start", { id });
  // #endregion
  const started = Date.now();
  const res = await fetchWithTimeout(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  // #region agent log
  debugLog("A", "publish-sync.ts:updateSiteContentRecord", "update done", {
    status: res.status,
    ms: Date.now() - started,
    bodyPreview: text.slice(0, 120),
  });
  // #endregion
  if (!res.ok) {
    throw new Error(`SiteContent update failed: HTTP ${res.status} ${text}`);
  }
}

async function main() {
  // #region agent log
  debugLog("B", "publish-sync.ts:main", "publish-sync start", {
    appId: APP_ID,
    clientSlug: CLIENT_SLUG,
    ci: Boolean(process.env.CI),
  });
  // #endregion

  if (!APP_ID) {
    console.error("Missing VITE_BASE44_APP_ID");
    process.exit(1);
  }

  const record = await fetchSiteContentRecord();
  const beforeMedia = storyMediaCount(record.document);
  const doc = structuredClone(record.document);
  const defaults = createDefaultSiteDocument();

  let syncedPages = 0;
  for (const defPage of defaults.pages) {
    const pubPage = doc.pages.find((p) => p.slug === defPage.slug);
    if (!pubPage) continue;

    syncPageSection(pubPage, defPage as Page, "content");
    syncedPages += 1;

    if (defPage.slug === "story") {
      syncPageSection(pubPage, defPage as Page, "media");
    }
  }

  const afterMedia = storyMediaCount(doc);
  const registryPage = doc.pages.find((p) => p.slug === "registry");
  const registryBody = registryPage?.sections
    .find((s) => s.sectionKey === "content")
    ?.blocks.find((b) => b.blockKey === "body")
    ?.value?.html;
  const registryHasCards =
    typeof registryBody === "string" && registryBody.includes("registry-wrap");

  // #region agent log
  debugLog("C", "publish-sync.ts:main", "sync computed", {
    syncedPages,
    beforeMedia,
    afterMedia,
    registryHasCards,
  });
  // #endregion

  await updateSiteContentRecord(record.id, {
    clientSlug: CLIENT_SLUG,
    document: { ...doc, updatedAt: new Date().toISOString() },
    updatedAt: new Date().toISOString(),
  });

  // #region agent log
  debugLog("D", "publish-sync.ts:main", "publish-sync success", {
    recordId: record.id,
    afterMedia,
    registryHasCards,
  });
  // #endregion

  console.log("Synced defaultSite content → Base44 SiteContent (live visitors).");
}

main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  // #region agent log
  debugLog("E", "publish-sync.ts:main", "publish-sync error", { message });
  // #endregion
  console.error(message);
  process.exit(1);
});
