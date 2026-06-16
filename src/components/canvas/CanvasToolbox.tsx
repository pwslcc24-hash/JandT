import { useRef } from "react";
import { cn } from "@/lib/utils";
import type { CanvasTool } from "@/canvas/types";

interface CanvasToolboxProps {
  activeTool: CanvasTool;
  onToolChange: (tool: CanvasTool) => void;
  onImageUpload: (file: File) => void;
  onGalleryImport: (files: FileList) => void;
  snapToGrid: boolean;
  onSnapToggle: () => void;
}

export default function CanvasToolbox({
  activeTool,
  onToolChange,
  onImageUpload,
  onGalleryImport,
  snapToGrid,
  onSnapToggle,
}: CanvasToolboxProps) {
  const imageRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);

  const tools: { id: CanvasTool; label: string; icon: string }[] = [
    { id: "select", label: "Select", icon: "↖" },
    { id: "text", label: "Text Box", icon: "T" },
    { id: "image", label: "Image Upload", icon: "🖼" },
    { id: "gallery", label: "Photo Folder", icon: "📁" },
    { id: "button", label: "Button", icon: "🔘" },
  ];

  return (
    <aside className="canvas-toolbox">
      <p className="canvas-toolbox-title">Tools</p>
      {tools.map((tool) => (
        <button
          key={tool.id}
          type="button"
          className={cn("canvas-tool-btn", activeTool === tool.id && "canvas-tool-btn--active")}
          onClick={() => {
            if (tool.id === "image") {
              imageRef.current?.click();
              onToolChange("image");
            } else if (tool.id === "gallery") {
              folderRef.current?.click();
              onToolChange("gallery");
            } else {
              onToolChange(tool.id);
            }
          }}
        >
          <span className="canvas-tool-icon">{tool.icon}</span>
          {tool.label}
        </button>
      ))}

      <input
        ref={imageRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onImageUpload(f);
          e.target.value = "";
        }}
      />
      <input
        ref={folderRef}
        type="file"
        // @ts-expect-error webkitdirectory is non-standard but widely supported
        webkitdirectory=""
        multiple
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          if (e.target.files?.length) onGalleryImport(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="canvas-toolbox-divider" />

      <button
        type="button"
        className={cn("canvas-tool-btn", snapToGrid && "canvas-tool-btn--active")}
        onClick={onSnapToggle}
      >
        <span className="canvas-tool-icon">⊞</span>
        Snap to Grid
      </button>
    </aside>
  );
}
