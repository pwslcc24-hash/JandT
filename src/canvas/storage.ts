import type { CanvasState } from "./types";

const PREFIX = "jayd-canvas";

export function canvasStorageKey(pageSlug: string): string {
  return `${PREFIX}-${pageSlug}`;
}

export function loadCanvasState(pageSlug: string): CanvasState | null {
  try {
    const raw = localStorage.getItem(canvasStorageKey(pageSlug));
    if (!raw) return null;
    return JSON.parse(raw) as CanvasState;
  } catch {
    return null;
  }
}

export function saveCanvasState(pageSlug: string, state: CanvasState): void {
  localStorage.setItem(canvasStorageKey(pageSlug), JSON.stringify(state));
}

export function createEmptyCanvasState(): CanvasState {
  return { elements: [], canvasHeight: 800 };
}
