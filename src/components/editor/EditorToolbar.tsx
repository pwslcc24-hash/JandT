import { useEditor } from "@/cms/context/EditorContext";
import { cn } from "@/lib/utils";
import {
  Monitor,
  Smartphone,
  Tablet,
  Undo2,
  Redo2,
  Pencil,
  PencilOff,
} from "lucide-react";

export default function EditorToolbar() {
  const {
    isAdmin,
    editMode,
    setEditMode,
    deviceMode,
    setDeviceMode,
    saveStatus,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditor();

  if (!isAdmin) return null;

  return (
    <div className="editor-toolbar">
      <button
        type="button"
        className={cn("editor-toolbar-btn editor-toolbar-btn--primary", editMode && "active")}
        onClick={() => setEditMode(!editMode)}
      >
        {editMode ? <PencilOff size={16} /> : <Pencil size={16} />}
        {editMode ? "Exit Edit Mode" : "Edit Mode"}
      </button>

      {editMode && (
        <>
          <div className="editor-toolbar-divider" />

          <button type="button" className="editor-toolbar-btn" disabled={!canUndo} onClick={undo} title="Undo">
            <Undo2 size={16} />
          </button>
          <button type="button" className="editor-toolbar-btn" disabled={!canRedo} onClick={redo} title="Redo">
            <Redo2 size={16} />
          </button>

          <div className="editor-toolbar-divider" />

          <div className="editor-device-group">
            {(["desktop", "tablet", "mobile"] as const).map((d) => (
              <button
                key={d}
                type="button"
                className={cn("editor-toolbar-btn", deviceMode === d && "active")}
                onClick={() => setDeviceMode(d)}
                title={d}
              >
                {d === "desktop" && <Monitor size={16} />}
                {d === "tablet" && <Tablet size={16} />}
                {d === "mobile" && <Smartphone size={16} />}
              </button>
            ))}
          </div>
        </>
      )}

      <span className="editor-save-status">
        {saveStatus === "saving" && "Saving…"}
        {saveStatus === "saved" && "Saved"}
        {saveStatus === "error" && "Save failed"}
      </span>
    </div>
  );
}
