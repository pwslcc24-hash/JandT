import { useCallback, type MouseEvent } from "react";
import { useEditor } from "@/cms/context/EditorContext";
import type { EditorSelection } from "@/cms/types";
import { cn } from "@/lib/utils";

interface UseEditorTargetOptions {
  pageSlug: string;
  sectionKey: string;
  blockKey?: string;
  blockId?: string;
  sectionId?: string;
  targetType?: "block" | "section";
  label?: string;
  meta?: Record<string, unknown>;
  className?: string;
}

export function useEditorTarget({
  pageSlug,
  sectionKey,
  blockKey = "",
  blockId = "",
  sectionId,
  targetType = "block",
  label,
  meta,
  className,
}: UseEditorTargetOptions) {
  const {
    editMode,
    isAdmin,
    aiPickMode,
    aiPanelOpen,
    selection,
    selectTarget,
  } = useEditor();

  const isTargeted =
    selection?.pageSlug === pageSlug &&
    selection?.sectionKey === sectionKey &&
    (targetType === "section"
      ? selection.targetType === "section"
      : selection?.blockKey === blockKey);

  const targetClass = cn(
    className,
    editMode && isAdmin && aiPickMode && "cms-pickable",
    isTargeted && aiPanelOpen && "cms-ai-target",
    isTargeted && "cms-selected"
  );

  const handleTargetPointer = useCallback(
    (e: MouseEvent) => {
      if (!editMode || !isAdmin || !aiPickMode) return false;
      e.preventDefault();
      e.stopPropagation();
      const target: EditorSelection = {
        pageSlug,
        sectionKey,
        blockKey: blockKey || sectionKey,
        blockId: blockId || blockKey || sectionId || sectionKey,
        sectionId,
        targetType,
        label,
        meta,
      };
      selectTarget(target);
      return true;
    },
    [
      editMode,
      isAdmin,
      aiPickMode,
      pageSlug,
      sectionKey,
      blockKey,
      blockId,
      sectionId,
      targetType,
      label,
      meta,
      selectTarget,
    ]
  );

  return { isTargeted, targetClass, handleTargetPointer, aiPickMode, aiPanelOpen };
}
