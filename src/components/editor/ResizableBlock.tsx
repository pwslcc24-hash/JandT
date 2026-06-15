import { useEditor } from "@/cms/context/EditorContext";
import { useEditorTarget } from "@/cms/hooks/useEditorTarget";
import { cn } from "@/lib/utils";
import { useCallback, useRef, useState, type ReactNode } from "react";

interface ResizableBlockProps {
  pageSlug: string;
  sectionKey: string;
  blockKey: string;
  blockId?: string;
  children: ReactNode;
  className?: string;
  onSelect?: () => void;
  targetLabel?: string;
}

export default function ResizableBlock({
  pageSlug,
  sectionKey,
  blockKey,
  blockId,
  children,
  className,
  onSelect,
  targetLabel,
}: ResizableBlockProps) {
  const {
    editMode,
    isAdmin,
    selection,
    setSelection,
    getBlockStyles,
    updateBlockStyles,
    deviceMode,
    aiPickMode,
  } = useEditor();

  const { targetClass, handleTargetPointer } = useEditorTarget({
    pageSlug,
    sectionKey,
    blockKey,
    blockId,
    label: targetLabel ?? `${sectionKey} / ${blockKey}`,
  });

  const ref = useRef<HTMLDivElement>(null);
  const styles = getBlockStyles(pageSlug, sectionKey, blockKey);
  const isSelected =
    selection?.blockKey === blockKey &&
    selection?.sectionKey === sectionKey &&
    selection?.pageSlug === pageSlug;
  const showHandles = editMode && isAdmin && isSelected && !aiPickMode;

  const handleSelect = (e: React.MouseEvent) => {
    if (!editMode || !isAdmin) return;
    if (handleTargetPointer(e)) return;
    e.stopPropagation();
    setSelection({
      pageSlug,
      sectionKey,
      blockKey,
      blockId: blockId ?? blockKey,
      targetType: "block",
    });
    onSelect?.();
  };

  const startResize = useCallback(
    (axis: "width" | "height" | "both") => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const el = ref.current;
      if (!el) return;

      const startW = el.offsetWidth;
      const startH = el.offsetHeight;

      const onMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        const patch: Record<string, string> = {};
        if (axis === "width" || axis === "both") {
          patch.width = `${Math.max(40, startW + dx)}px`;
        }
        if (axis === "height" || axis === "both") {
          patch.height = `${Math.max(24, startH + dy)}px`;
        }
        updateBlockStyles(pageSlug, sectionKey, blockKey, patch);
      };

      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [pageSlug, sectionKey, blockKey, updateBlockStyles]
  );

  return (
    <div
      ref={ref}
      className={cn(
        "cms-resizable",
        editMode && isAdmin && "cms-editable",
        isSelected && !aiPickMode && "cms-selected",
        targetClass,
        className
      )}
      style={styles as React.CSSProperties}
      onClick={handleSelect}
      data-device={deviceMode}
    >
      {children}
      {showHandles && (
        <>
          <span
            className="resize-handle resize-e"
            onMouseDown={startResize("width")}
            aria-hidden
          />
          <span
            className="resize-handle resize-s"
            onMouseDown={startResize("height")}
            aria-hidden
          />
          <span
            className="resize-handle resize-se"
            onMouseDown={startResize("both")}
            aria-hidden
          />
        </>
      )}
    </div>
  );
}
