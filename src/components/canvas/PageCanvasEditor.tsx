import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEditor } from "@/cms/context/EditorContext";
import { useCanvasEditor } from "@/canvas/useCanvasEditor";
import { CANVAS_WIDTH } from "@/canvas/types";
import CanvasToolbox from "./CanvasToolbox";
import CanvasElementRenderer from "./CanvasElementRenderer";
import { Eye, Pencil } from "lucide-react";

export default function PageCanvasEditor() {
  const [searchParams] = useSearchParams();
  const pageSlug = searchParams.get("page") || "custom";
  const { isAdmin } = useEditor();

  const editor = useCanvasEditor(pageSlug);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (editor.previewMode) return;
      if (e.target !== e.currentTarget) return;

      editor.setSelectedId(null);
      editor.setEditingTextId(null);

      if (editor.activeTool === "text" || editor.activeTool === "button") {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top + e.currentTarget.scrollTop;
        editor.placeAt(x, y);
      }
    },
    [editor]
  );

  if (!isAdmin) {
    return (
      <div className="canvas-builder-locked">
        <p>Unlock studio at <a href="/studio">/studio</a> to use the page builder.</p>
      </div>
    );
  }

  return (
    <div className="canvas-builder">
      <div className="canvas-builder-topbar">
        <h1 className="canvas-builder-title">Page Builder — {pageSlug}</h1>
        <div className="canvas-builder-topbar-actions">
          <button
            type="button"
            className={cn("canvas-mode-btn", !editor.previewMode && "canvas-mode-btn--active")}
            onClick={() => editor.setPreviewMode(false)}
          >
            <Pencil size={14} />
            Edit Mode
          </button>
          <button
            type="button"
            className={cn("canvas-mode-btn", editor.previewMode && "canvas-mode-btn--active")}
            onClick={() => {
              editor.setPreviewMode(true);
              editor.setEditingTextId(null);
            }}
          >
            <Eye size={14} />
            Preview Mode
          </button>
        </div>
      </div>

      <div className="canvas-builder-body">
        {!editor.previewMode && (
          <CanvasToolbox
            activeTool={editor.activeTool}
            onToolChange={editor.setActiveTool}
            onImageUpload={(file) => editor.insertImage(file)}
            onGalleryImport={(files) => editor.importGalleryFolder(files)}
            snapToGrid={editor.snapToGrid}
            onSnapToggle={() => editor.setSnapToGrid((v) => !v)}
          />
        )}

        <div className="canvas-builder-scroll">
          <div
            className={cn(
              "canvas-page",
              editor.previewMode && "canvas-page--preview",
              !editor.previewMode && "canvas-page--editing"
            )}
            style={{ width: CANVAS_WIDTH, minHeight: editor.state.canvasHeight }}
            onClick={handleCanvasClick}
          >
            {editor.previewMode && (
              <div className="canvas-preview-banner">Preview — buttons and links are live</div>
            )}
            {!editor.previewMode && (
              <div className="canvas-edit-banner">Edit Mode — drag, resize, and place elements</div>
            )}

            {editor.sortedElements.map((el) => (
              <CanvasElementRenderer
                key={el.id}
                element={el}
                selected={editor.selectedId === el.id}
                previewMode={editor.previewMode}
                isEditing={editor.editingTextId === el.id}
                onSelect={() => editor.setSelectedId(el.id)}
                onStartDrag={(cx, cy) => editor.startDrag(el.id, cx, cy)}
                onStartResize={(cx, cy, shift) => editor.startResize(el.id, cx, cy, shift)}
                onUpdate={(patch) => editor.updateElement(el.id, patch)}
                onDelete={() => editor.deleteElement(el.id)}
                onDuplicate={() => editor.duplicateElement(el.id)}
                onBringForward={() => editor.bringForward(el.id)}
                onSendBackward={() => editor.sendBackward(el.id)}
                onBringToFront={() => editor.bringToFront(el.id)}
                onSendToBack={() => editor.sendToBack(el.id)}
                onEditStart={() => editor.setEditingTextId(el.id)}
                onEditEnd={() => editor.setEditingTextId(null)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
