import { useEffect, useRef, useState } from "react";
import type { CanvasElement } from "@/canvas/types";

interface TextFormatBarProps {
  element: CanvasElement;
  onUpdate: (patch: Partial<CanvasElement>) => void;
}

export default function TextFormatBar({ element, onUpdate }: TextFormatBarProps) {
  const [visible, setVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onSelection = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        setVisible(false);
        return;
      }
      const node = sel.anchorNode;
      const editable = node?.parentElement?.closest("[data-canvas-text]");
      setVisible(!!editable);
    };
    document.addEventListener("selectionchange", onSelection);
    return () => document.removeEventListener("selectionchange", onSelection);
  }, []);

  if (!visible) return null;

  const exec = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
  };

  return (
    <div ref={barRef} className="canvas-text-format-bar">
      <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("bold"); }} title="Bold">
        <b>B</b>
      </button>
      <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("italic"); }} title="Italic">
        <i>I</i>
      </button>
      <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("underline"); }} title="Underline">
        <u>U</u>
      </button>
      <select
        value={element.fontSize ?? 16}
        onChange={(e) => {
          onUpdate({ fontSize: Number(e.target.value) });
          exec("fontSize", "4");
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {[12, 14, 16, 18, 24, 32, 48].map((s) => (
          <option key={s} value={s}>{s}px</option>
        ))}
      </select>
      <select
        value={element.fontFamily ?? "inherit"}
        onChange={(e) => onUpdate({ fontFamily: e.target.value })}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <option value="inherit">Sans-serif</option>
        <option value="Georgia, serif">Serif</option>
        <option value="'Times New Roman', Times, serif">Times</option>
        <option value="monospace">Monospace</option>
      </select>
      <input
        type="color"
        value={element.color ?? "#1a1a1a"}
        onChange={(e) => onUpdate({ color: e.target.value })}
        title="Text color"
        onMouseDown={(e) => e.stopPropagation()}
      />
    </div>
  );
}
