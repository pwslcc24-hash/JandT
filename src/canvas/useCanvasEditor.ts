import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  CANVAS_WIDTH,
  DEFAULT_BUTTON,
  DEFAULT_IMAGE,
  DEFAULT_TEXT,
  GRID_SIZE,
  type CanvasElement,
  type CanvasState,
  type CanvasTool,
} from "./types";
import { createEmptyCanvasState, loadCanvasState, saveCanvasState } from "./storage";

function snapValue(value: number, enabled: boolean): number {
  if (!enabled) return Math.round(value);
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

function nextZIndex(elements: CanvasElement[]): number {
  if (!elements.length) return 1;
  return Math.max(...elements.map((e) => e.zIndex)) + 1;
}

function cloneElements(elements: CanvasElement[]): CanvasElement[] {
  return elements.map((e) => ({ ...e }));
}

export function useCanvasEditor(pageSlug: string) {
  const [state, setState] = useState<CanvasState>(() => {
    return loadCanvasState(pageSlug) ?? createEmptyCanvasState();
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<CanvasTool>("select");
  const [previewMode, setPreviewMode] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const historyRef = useRef<CanvasState[]>([]);
  const futureRef = useRef<CanvasState[]>([]);
  const [historyTick, setHistoryTick] = useState(0);

  useEffect(() => {
    const loaded = loadCanvasState(pageSlug) ?? createEmptyCanvasState();
    setState(loaded);
    historyRef.current = [loaded];
    futureRef.current = [];
    setSelectedId(null);
    setEditingTextId(null);
  }, [pageSlug]);

  const pushHistory = useCallback((next: CanvasState) => {
    historyRef.current = [...historyRef.current.slice(-49), next];
    futureRef.current = [];
    setHistoryTick((t) => t + 1);
    saveCanvasState(pageSlug, next);
  }, [pageSlug]);

  const commit = useCallback(
    (updater: (prev: CanvasState) => CanvasState) => {
      setState((prev) => {
        const next = updater(prev);
        pushHistory(next);
        return next;
      });
    },
    [pushHistory]
  );

  const undo = useCallback(() => {
    if (historyRef.current.length <= 1) return;
    const current = historyRef.current[historyRef.current.length - 1];
    futureRef.current = [current, ...futureRef.current];
    historyRef.current = historyRef.current.slice(0, -1);
    const prev = historyRef.current[historyRef.current.length - 1];
    setState(prev);
    setHistoryTick((t) => t + 1);
    saveCanvasState(pageSlug, prev);
  }, [pageSlug]);

  const redo = useCallback(() => {
    if (!futureRef.current.length) return;
    const [next, ...rest] = futureRef.current;
    futureRef.current = rest;
    historyRef.current = [...historyRef.current, next];
    setState(next);
    setHistoryTick((t) => t + 1);
    saveCanvasState(pageSlug, next);
  }, [pageSlug]);

  const addElement = useCallback(
    (partial: Omit<CanvasElement, "id" | "zIndex"> & { id?: string }) => {
      const id = partial.id ?? uuidv4();
      commit((prev) => {
        const zIndex = nextZIndex(prev.elements);
        const el: CanvasElement = { ...partial, id, zIndex };
        const canvasHeight = Math.max(prev.canvasHeight, el.y + el.height + 80);
        return { elements: [...prev.elements, el], canvasHeight };
      });
      setSelectedId(id);
      setActiveTool("select");
      return id;
    },
    [commit]
  );

  const updateElement = useCallback(
    (id: string, patch: Partial<CanvasElement>) => {
      commit((prev) => {
        const elements = prev.elements.map((e) => (e.id === id ? { ...e, ...patch } : e));
        const el = elements.find((e) => e.id === id);
        const canvasHeight = el
          ? Math.max(prev.canvasHeight, el.y + el.height + 80)
          : prev.canvasHeight;
        return { elements, canvasHeight };
      });
    },
    [commit]
  );

  const deleteElement = useCallback(
    (id: string) => {
      commit((prev) => ({
        ...prev,
        elements: prev.elements.filter((e) => e.id !== id),
      }));
      setSelectedId((s) => (s === id ? null : s));
      setEditingTextId((s) => (s === id ? null : s));
    },
    [commit]
  );

  const duplicateElement = useCallback(
    (id: string) => {
      const source = state.elements.find((e) => e.id === id);
      if (!source) return;
      addElement({
        ...source,
        x: source.x + 20,
        y: source.y + 20,
      });
    },
    [state.elements, addElement]
  );

  const bringForward = useCallback(
    (id: string) => {
      commit((prev) => {
        const sorted = [...prev.elements].sort((a, b) => a.zIndex - b.zIndex);
        const idx = sorted.findIndex((e) => e.id === id);
        if (idx < 0 || idx >= sorted.length - 1) return prev;
        const next = cloneElements(prev.elements);
        const a = next.find((e) => e.id === sorted[idx].id)!;
        const b = next.find((e) => e.id === sorted[idx + 1].id)!;
        const tmp = a.zIndex;
        a.zIndex = b.zIndex;
        b.zIndex = tmp;
        return { ...prev, elements: next };
      });
    },
    [commit]
  );

  const sendBackward = useCallback(
    (id: string) => {
      commit((prev) => {
        const sorted = [...prev.elements].sort((a, b) => a.zIndex - b.zIndex);
        const idx = sorted.findIndex((e) => e.id === id);
        if (idx <= 0) return prev;
        const next = cloneElements(prev.elements);
        const a = next.find((e) => e.id === sorted[idx].id)!;
        const b = next.find((e) => e.id === sorted[idx - 1].id)!;
        const tmp = a.zIndex;
        a.zIndex = b.zIndex;
        b.zIndex = tmp;
        return { ...prev, elements: next };
      });
    },
    [commit]
  );

  const bringToFront = useCallback(
    (id: string) => {
      commit((prev) => {
        const maxZ = nextZIndex(prev.elements);
        return {
          ...prev,
          elements: prev.elements.map((e) =>
            e.id === id ? { ...e, zIndex: maxZ } : e
          ),
        };
      });
    },
    [commit]
  );

  const sendToBack = useCallback(
    (id: string) => {
      commit((prev) => {
        const elements = prev.elements.map((e) =>
          e.id === id ? { ...e, zIndex: 0 } : { ...e, zIndex: e.zIndex + 1 }
        );
        return { ...prev, elements };
      });
    },
    [commit]
  );

  const placeAt = useCallback(
    (x: number, y: number) => {
      const sx = snapValue(x, snapToGrid);
      const sy = snapValue(y, snapToGrid);

      if (activeTool === "text") {
        addElement({
          type: "text",
          x: sx,
          y: sy,
          width: DEFAULT_TEXT.width,
          height: DEFAULT_TEXT.height,
          content: "Double-click to edit",
          fontSize: 16,
          fontFamily: "inherit",
          fontWeight: "400",
          color: "#1a1a1a",
          textAlign: "left",
        });
      } else if (activeTool === "button") {
        addElement({
          type: "button",
          x: sx,
          y: sy,
          width: DEFAULT_BUTTON.width,
          height: DEFAULT_BUTTON.height,
          label: "Click me",
          href: "",
          backgroundColor: "#1a1a1a",
          buttonColor: "#ffffff",
          borderRadius: 8,
          buttonFontSize: 14,
        });
      }
    },
    [activeTool, addElement, snapToGrid]
  );

  const insertImage = useCallback(
    (file: File, x = 40, y = 40) => {
      const src = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const ratio = img.naturalWidth / img.naturalHeight;
        let width = DEFAULT_IMAGE.width;
        let height = Math.round(width / ratio);
        if (height > 400) {
          height = 400;
          width = Math.round(height * ratio);
        }
        addElement({
          type: "image",
          x: snapValue(x, snapToGrid),
          y: snapValue(y, snapToGrid),
          width,
          height,
          src,
        });
      };
      img.src = src;
    },
    [addElement, snapToGrid]
  );

  const importGalleryFolder = useCallback(
    (files: FileList | File[]) => {
      const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
      const COLS = 3;
      const PAD = 16;
      const CELL_W = 200;
      const CELL_H = 200;
      const startX = 40;
      const startY = 40;

      images.forEach((file, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x = startX + col * (CELL_W + PAD);
        const y = startY + row * (CELL_H + PAD);
        const src = URL.createObjectURL(file);
        addElement({
          type: "image",
          x: snapValue(x, snapToGrid),
          y: snapValue(y, snapToGrid),
          width: CELL_W,
          height: CELL_H,
          src,
        });
      });
      setActiveTool("select");
    },
    [addElement, snapToGrid]
  );

  const startDrag = useCallback(
    (id: string, clientX: number, clientY: number) => {
      const el = state.elements.find((e) => e.id === id);
      if (!el) return () => {};

      const startX = clientX;
      const startY = clientY;
      const origX = el.x;
      const origY = el.y;

      const onMove = (ev: MouseEvent) => {
        const nx = snapValue(origX + (ev.clientX - startX), snapToGrid);
        const ny = snapValue(origY + (ev.clientY - startY), snapToGrid);
        setState((prev) => ({
          ...prev,
          elements: prev.elements.map((e) =>
            e.id === id ? { ...e, x: Math.max(0, Math.min(nx, CANVAS_WIDTH - e.width)), y: Math.max(0, ny) } : e
          ),
        }));
      };

      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        setState((prev) => {
          pushHistory(prev);
          return prev;
        });
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      return onUp;
    },
    [state.elements, snapToGrid, pushHistory]
  );

  const startResize = useCallback(
    (id: string, clientX: number, clientY: number, shiftKey: boolean) => {
      const el = state.elements.find((e) => e.id === id);
      if (!el) return () => {};

      const startX = clientX;
      const startY = clientY;
      const origW = el.width;
      const origH = el.height;
      const aspect = origW / origH;

      const onMove = (ev: MouseEvent) => {
        let nw = Math.max(40, origW + (ev.clientX - startX));
        let nh = Math.max(24, origH + (ev.clientY - startY));

        if (el.type === "image" && !ev.shiftKey && !shiftKey) {
          nh = Math.round(nw / aspect);
        }

        nw = snapValue(nw, snapToGrid);
        nh = snapValue(nh, snapToGrid);

        setState((prev) => ({
          ...prev,
          elements: prev.elements.map((e) =>
            e.id === id ? { ...e, width: nw, height: nh } : e
          ),
          canvasHeight: Math.max(prev.canvasHeight, el.y + nh + 80),
        }));
      };

      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        setState((prev) => {
          pushHistory(prev);
          return prev;
        });
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      return onUp;
    },
    [state.elements, snapToGrid, pushHistory]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId && !editingTextId) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;
        e.preventDefault();
        deleteElement(selectedId);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, selectedId, editingTextId, deleteElement]);

  const selected = state.elements.find((e) => e.id === selectedId) ?? null;
  const sortedElements = [...state.elements].sort((a, b) => a.zIndex - b.zIndex);

  return {
    state,
    sortedElements,
    selected,
    selectedId,
    setSelectedId,
    activeTool,
    setActiveTool,
    previewMode,
    setPreviewMode,
    snapToGrid,
    setSnapToGrid,
    editingTextId,
    setEditingTextId,
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    placeAt,
    insertImage,
    importGalleryFolder,
    startDrag,
    startResize,
    undo,
    redo,
    canUndo: historyRef.current.length > 1,
    canRedo: futureRef.current.length > 0,
    historyTick,
  };
}
