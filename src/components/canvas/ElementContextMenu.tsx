import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ElementContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
}

export default function ElementContextMenu({
  x,
  y,
  onClose,
  onDelete,
  onDuplicate,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
}: ElementContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [onClose]);

  const items = [
    { label: "Duplicate", action: onDuplicate },
    { label: "Bring to Front", action: onBringToFront },
    { label: "Bring Forward", action: onBringForward },
    { label: "Send Backward", action: onSendBackward },
    { label: "Send to Back", action: onSendToBack },
    { label: "Delete", action: onDelete, danger: true },
  ];

  return (
    <div
      ref={ref}
      className="canvas-context-menu"
      style={{ left: x, top: y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          className={cn("canvas-context-item", item.danger && "canvas-context-item--danger")}
          onClick={() => {
            item.action();
            onClose();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

interface ElementHoverToolbarProps {
  onDelete: () => void;
  onDuplicate: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
}

export function ElementHoverToolbar({
  onDelete,
  onDuplicate,
  onBringForward,
  onSendBackward,
}: ElementHoverToolbarProps) {
  return (
    <div className="canvas-hover-toolbar">
      <button type="button" title="Duplicate" onClick={onDuplicate}>⧉</button>
      <button type="button" title="Bring Forward" onClick={onBringForward}>↑</button>
      <button type="button" title="Send Backward" onClick={onSendBackward}>↓</button>
      <button type="button" title="Delete" onClick={onDelete}>✕</button>
    </div>
  );
}
