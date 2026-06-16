import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { CanvasElement } from "@/canvas/types";
import { ElementHoverToolbar } from "./ElementContextMenu";
import ElementContextMenu from "./ElementContextMenu";
import TextFormatBar from "./TextFormatBar";

interface CanvasElementRendererProps {
  element: CanvasElement;
  selected: boolean;
  previewMode: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onStartDrag: (clientX: number, clientY: number) => void;
  onStartResize: (clientX: number, clientY: number, shiftKey: boolean) => void;
  onUpdate: (patch: Partial<CanvasElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onEditStart: () => void;
  onEditEnd: () => void;
}

export default function CanvasElementRenderer({
  element,
  selected,
  previewMode,
  isEditing,
  onSelect,
  onStartDrag,
  onStartResize,
  onUpdate,
  onDelete,
  onDuplicate,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onEditStart,
  onEditEnd,
}: CanvasElementRendererProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [showButtonUrl, setShowButtonUrl] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && element.type === "text" && textRef.current) {
      textRef.current.innerHTML = element.content ?? "";
      textRef.current.focus();
    }
  }, [isEditing, element.type, element.content]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (previewMode) return;
    if ((e.target as HTMLElement).closest(".canvas-resize-handle")) return;
    if ((e.target as HTMLElement).closest(".canvas-hover-toolbar")) return;
    if ((e.target as HTMLElement).closest(".canvas-button-url-input")) return;
    if (isEditing) return;

    e.stopPropagation();
    onSelect();

    if (element.type === "button" && (e.target as HTMLElement).closest(".canvas-element-button, .canvas-button-edit-input, .canvas-button-settings, .canvas-button-url-input")) {
      return;
    }

    onStartDrag(e.clientX, e.clientY);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (previewMode) return;
    e.stopPropagation();
    if (element.type === "text" || element.type === "button") {
      onEditStart();
      if (element.type === "text") {
        requestAnimationFrame(() => textRef.current?.focus());
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (previewMode) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleTextBlur = useCallback(() => {
    if (!textRef.current) return;
    onUpdate({ content: textRef.current.innerHTML });
    onEditEnd();
  }, [onUpdate, onEditEnd]);

  const handleButtonClick = (e: React.MouseEvent) => {
    if (previewMode) {
      if (element.href) {
        window.open(element.href, element.href.startsWith("http") ? "_blank" : "_self");
      }
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    onSelect();
  };

  return (
    <>
      <div
        className={cn(
          "canvas-element",
          `canvas-element--${element.type}`,
          selected && !previewMode && "canvas-element--selected",
          previewMode && "canvas-element--preview"
        )}
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          zIndex: element.zIndex,
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        {element.type === "image" && (
          <img
            src={element.src}
            alt=""
            className="canvas-element-image"
            draggable={false}
          />
        )}

        {element.type === "text" && (
          isEditing && !previewMode ? (
            <div
              ref={textRef}
              data-canvas-text
              className="canvas-element-text"
              contentEditable
              suppressContentEditableWarning
              style={{
                fontSize: element.fontSize,
                fontFamily: element.fontFamily,
                fontWeight: element.fontWeight,
                fontStyle: element.fontStyle,
                textDecoration: element.textDecoration,
                color: element.color,
                textAlign: element.textAlign,
              }}
              onBlur={handleTextBlur}
              onMouseDown={(e) => e.stopPropagation()}
            />
          ) : (
            <div
              className="canvas-element-text"
              style={{
                fontSize: element.fontSize,
                fontFamily: element.fontFamily,
                fontWeight: element.fontWeight,
                fontStyle: element.fontStyle,
                textDecoration: element.textDecoration,
                color: element.color,
                textAlign: element.textAlign,
              }}
              dangerouslySetInnerHTML={{ __html: element.content ?? "" }}
            />
          )
        )}

        {element.type === "button" && (
          <div className="canvas-button-wrap">
            {isEditing ? (
              <input
                className="canvas-button-edit-input"
                value={element.label ?? ""}
                onChange={(e) => onUpdate({ label: e.target.value })}
                onBlur={onEditEnd}
                onMouseDown={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              <button
                type="button"
                className="canvas-element-button"
                style={{
                  backgroundColor: element.backgroundColor,
                  color: element.buttonColor,
                  borderRadius: element.borderRadius,
                  fontSize: element.buttonFontSize,
                }}
                onClick={handleButtonClick}
              >
                {element.label || "Button"}
              </button>
            )}
            {selected && !previewMode && !isEditing && (
              <button
                type="button"
                className="canvas-button-settings"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowButtonUrl((v) => !v);
                }}
              >
                ⚙
              </button>
            )}
            {showButtonUrl && selected && !previewMode && (
              <div className="canvas-button-url-input" onMouseDown={(e) => e.stopPropagation()}>
                <input
                  type="url"
                  placeholder="Link URL"
                  value={element.href ?? ""}
                  onChange={(e) => onUpdate({ href: e.target.value })}
                />
                <input
                  type="color"
                  title="Background"
                  value={element.backgroundColor ?? "#1a1a1a"}
                  onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                />
                <input
                  type="color"
                  title="Text color"
                  value={element.buttonColor ?? "#ffffff"}
                  onChange={(e) => onUpdate({ buttonColor: e.target.value })}
                />
                <input
                  type="number"
                  title="Border radius"
                  min={0}
                  max={48}
                  value={element.borderRadius ?? 8}
                  onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) })}
                />
                <input
                  type="number"
                  title="Font size"
                  min={10}
                  max={32}
                  value={element.buttonFontSize ?? 14}
                  onChange={(e) => onUpdate({ buttonFontSize: Number(e.target.value) })}
                />
              </div>
            )}
          </div>
        )}

        {selected && !previewMode && (
          <>
            <ElementHoverToolbar
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onBringForward={onBringForward}
              onSendBackward={onSendBackward}
            />
            <span
              className="canvas-resize-handle"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onStartResize(e.clientX, e.clientY, e.shiftKey);
              }}
            />
          </>
        )}
      </div>

      {element.type === "text" && selected && isEditing && !previewMode && (
        <TextFormatBar element={element} onUpdate={onUpdate} />
      )}

      {contextMenu && (
        <ElementContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onBringForward={onBringForward}
          onSendBackward={onSendBackward}
          onBringToFront={onBringToFront}
          onSendToBack={onSendToBack}
        />
      )}
    </>
  );
}
