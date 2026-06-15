import EditorToolbar from "./EditorToolbar";
import PropertiesPanel from "./PropertiesPanel";
import AiEditorPanel from "./AiEditorPanel";
import { useEditor } from "@/cms/context/EditorContext";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function EditorShell({ children }: { children: React.ReactNode }) {
  const { editMode, isAdmin, deviceMode, aiPanelOpen, aiPickMode } = useEditor();
  const [propertiesCollapsed, setPropertiesCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "editor-shell",
        propertiesCollapsed && "editor-shell--props-collapsed"
      )}
    >
      <EditorToolbar />
      <div
        className={cn(
          "editor-viewport",
          editMode && isAdmin && "editor-viewport--editing",
          editMode && aiPanelOpen && "editor-viewport--ai-open",
          editMode && aiPickMode && "editor-viewport--pick-mode",
          editMode && deviceMode === "tablet" && "editor-viewport--tablet",
          editMode && deviceMode === "mobile" && "editor-viewport--mobile"
        )}
      >
        {children}
      </div>
      <PropertiesPanel
        collapsed={propertiesCollapsed}
        onToggleCollapsed={() => setPropertiesCollapsed((v) => !v)}
      />
      <AiEditorPanel />
    </div>
  );
}
