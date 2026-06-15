import type { SiteDocument } from "../types";

/** Copy before sorting — never sort arrays from React state in place. */
export function sortedCopy<T>(items: readonly T[], compare: (a: T, b: T) => number): T[] {
  return [...items].sort(compare);
}

export function cloneSiteDocument<T>(doc: T): T {
  return structuredClone(doc);
}

export function touchSiteDocument(doc: SiteDocument): SiteDocument {
  const snapshot = cloneSiteDocument(doc);
  snapshot.updatedAt = new Date().toISOString();
  return snapshot;
}
