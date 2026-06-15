import { useEditor } from "@/cms/context/EditorContext";
import { useEditorTarget } from "@/cms/hooks/useEditorTarget";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef } from "react";
import ResizableBlock from "./ResizableBlock";

interface EditableTextProps {
  pageSlug: string;
  sectionKey: string;
  blockKey: string;
  fallback?: string;
  className?: string;
  as?: "div" | "span" | "h1" | "h2" | "p";
  resizable?: boolean;
}

export default function EditableText({
  pageSlug,
  sectionKey,
  blockKey,
  fallback = "",
  className,
  as: Tag = "span",
  resizable = true,
}: EditableTextProps) {
  const {
    site,
    editMode,
    isAdmin,
    updateBlockText,
    setSelection,
    selection,
    getBlockStyles,
  } = useEditor();

  const ref = useRef<HTMLElement>(null);
  const page = site?.pages.find((p) => p.slug === pageSlug);
  const section = page?.sections.find((s) => s.sectionKey === sectionKey);
  const block = section?.blocks.find((b) => b.blockKey === blockKey);
  const text = String(block?.value?.text ?? fallback);
  const styles = getBlockStyles(pageSlug, sectionKey, blockKey);
  const isSelected =
    selection?.blockKey === blockKey &&
    selection?.sectionKey === sectionKey &&
    selection?.pageSlug === pageSlug;
  const editable = editMode && isAdmin;

  const { targetClass, handleTargetPointer, aiPickMode } = useEditorTarget({
    pageSlug,
    sectionKey,
    blockKey,
    blockId: block?.id,
    label: `${sectionKey} / ${blockKey}`,
  });

  useEffect(() => {
    if (ref.current && ref.current.textContent !== text) {
      ref.current.textContent = text;
    }
  }, [text]);

  const handleBlur = useCallback(() => {
    if (!ref.current) return;
    const newText = ref.current.textContent ?? "";
    if (newText !== text) updateBlockText(pageSlug, sectionKey, blockKey, newText);
  }, [text, updateBlockText, pageSlug, sectionKey, blockKey]);

  const handleClick = (e: React.MouseEvent) => {
    if (!editable) return;
    if (handleTargetPointer(e)) return;
    e.stopPropagation();
    setSelection({
      pageSlug,
      sectionKey,
      blockKey,
      blockId: block?.id ?? blockKey,
      targetType: "block",
    });
  };

  const inner = (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(
        className,
        editable && !resizable && "cms-editable",
        editable && !resizable && isSelected && !aiPickMode && "cms-selected",
        editable && !resizable && targetClass
      )}
      style={resizable ? undefined : (styles as React.CSSProperties)}
      contentEditable={editable && !aiPickMode}
      suppressContentEditableWarning
      onBlur={handleBlur}
      onClick={resizable ? undefined : handleClick}
    >
      {text}
    </Tag>
  );

  if (!resizable) return inner;

  return (
    <ResizableBlock
      pageSlug={pageSlug}
      sectionKey={sectionKey}
      blockKey={blockKey}
      blockId={block?.id}
      className="cms-editable-text-wrap"
    >
      {inner}
    </ResizableBlock>
  );
}
