import { Link } from "react-router-dom";
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
  Lock,
  Sparkles,
  CloudUpload,
  Layout,
} from "lucide-react";

export default function EditorToolbar() {
  const {
    isAdmin,
    editMode,
    setEditMode,
    deviceMode,
    setDeviceMode,
    saveStatus,
    publishStatus,
    publishError,
    publishSite,
    undo,
    redo,
    canUndo,
    canRedo,
    logout,
    aiPanelOpen,
    setAiPanelOpen,
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

          <button
            type="button"
            className={cn(
              "editor-toolbar-btn editor-toolbar-btn--save-live",
              publishStatus === "published" && "active"
            )}
            disabled={publishStatus === "publishing"}
            onClick={() => publishSite()}
            title="Save changes live for all visitors"
          >
            <CloudUpload size={16} />
            {publishStatus === "publishing"
              ? "Saving live…"
              : publishStatus === "published"
                ? "Saved live!"
                : "Save Live"}
          </button>

          <div className="editor-toolbar-divider" />

          <button
            type="button"
            className={cn("editor-toolbar-btn", aiPanelOpen && "active")}
            onClick={() => setAiPanelOpen(!aiPanelOpen)}
            title="AI Editor"
          >
            <Sparkles size={16} />
            AI Edit
          </button>

          <Link
            to="/builder?page=custom"
            className="editor-toolbar-btn"
            title="Page Builder"
          >
            <Layout size={16} />
            Builder
          </Link>

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
        {publishStatus === "publishing" && "Publishing…"}
        {publishStatus === "published" && "Saved live!"}
        {publishStatus === "error" && (publishError || "Publish failed")}
        {publishStatus === "idle" && saveStatus === "saving" && "Draft saving…"}
        {publishStatus === "idle" && saveStatus === "saved" && "Draft saved locally"}
        {publishStatus === "idle" && saveStatus === "error" && "Draft save failed"}
      </span>

      <button
        type="button"
        className="editor-toolbar-btn"
        onClick={() => logout()}
        title="Lock studio"
      >
        <Lock size={16} />
      </button>
    </div>
  );
}
