/** Copy before sorting — site arrays from Immer state are read-only. */
export function sortedCopy<T>(items: readonly T[], compare: (a: T, b: T) => number): T[] {
  return [...items].sort(compare);
}

export function cloneSiteDocument<T>(doc: T): T {
  return structuredClone(doc);
}
