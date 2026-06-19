import { useEditor } from "@/cms/context/EditorContext";
import { cn } from "@/lib/utils";
import { useEditor as useTiptapEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import ResizableBlock from "./ResizableBlock";

interface EditableRichTextProps {
  pageSlug: string;
  sectionKey: string;
  blockKey: string;
  fallback?: string;
  className?: string;
}

export default function EditableRichText({
  pageSlug,
  sectionKey,
  blockKey,
  fallback = "<p></p>",
  className,
}: EditableRichTextProps) {
  const {
    site,
    editMode,
    isAdmin,
    updateBlockValue,
    selection,
    aiPickMode,
  } = useEditor();

  const page = site?.pages.find((p) => p.slug === pageSlug);
  const section = page?.sections.find((s) => s.sectionKey === sectionKey);
  const block = section?.blocks.find((b) => b.blockKey === blockKey);
  const html = String(block?.value?.html ?? fallback);
  const editable = editMode && isAdmin && !aiPickMode;

  const isSelected =
    selection?.blockKey === blockKey &&
    selection?.sectionKey === sectionKey &&
    selection?.pageSlug === pageSlug;

  return (
    <ResizableBlock
      pageSlug={pageSlug}
      sectionKey={sectionKey}
      blockKey={blockKey}
      blockId={block?.id}
      className={cn("cms-rich-text-wrap", isSelected && !aiPickMode && "cms-rich-text-wrap--selected")}
    >
      {editable ? (
        <EditableRichTextEditor
          html={html}
          className={className}
          editable={editable}
          onHtmlChange={(nextHtml) => updateBlockValue(pageSlug, sectionKey, blockKey, { html: nextHtml })}
        />
      ) : (
        <div
          className={cn("cms-rich-text", className)}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </ResizableBlock>
  );
}

interface EditableRichTextEditorProps {
  html: string;
  className?: string;
  editable: boolean;
  onHtmlChange: (html: string) => void;
}

function EditableRichTextEditor({
  html,
  className,
  editable,
  onHtmlChange,
}: EditableRichTextEditorProps) {
  const editor = useTiptapEditor({
    extensions: [StarterKit],
    content: html,
    editable,
    onUpdate: ({ editor: ed }) => {
      onHtmlChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  useEffect(() => {
    if (editor && !editor.isDestroyed && html !== editor.getHTML()) {
      editor.commands.setContent(html, false);
    }
  }, [html, editor]);

  return (
    <EditorContent
      editor={editor}
      className={cn("cms-rich-text", className, editable && "cms-rich-text--editing")}
    />
  );
}
