import EditorToolbar from "./EditorToolbar";
import PropertiesPanel from "./PropertiesPanel";
import { useEditor } from "@/cms/context/EditorContext";
import { cn } from "@/lib/utils";

export default function EditorShell({ children }: { children: React.ReactNode }) {
  const { editMode, isAdmin, deviceMode } = useEditor();

  return (
    <>
      <EditorToolbar />
      <div
        className={cn(
          "editor-viewport",
          editMode && isAdmin && "editor-viewport--editing",
          editMode && deviceMode === "tablet" && "editor-viewport--tablet",
          editMode && deviceMode === "mobile" && "editor-viewport--mobile"
        )}
      >
        {children}
      </div>
      <PropertiesPanel />
    </>
  );
}
