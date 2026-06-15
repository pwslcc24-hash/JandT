import { useEditor } from "@/cms/context/EditorContext";
import type { ElementStyles } from "@/cms/types";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

const FONT_PRESETS = [
  { label: "S", value: "14px" },
  { label: "M", value: "18px" },
  { label: "L", value: "24px" },
  { label: "XL", value: "32px" },
  { label: "2XL", value: "48px" },
  { label: "3XL", value: "64px" },
];

const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Serif", value: "var(--font-serif)" },
  { label: "Sans", value: "var(--font-sans)" },
];

function parseFontSize(value?: string): number {
  if (!value) return 18;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 18;
}

interface PropertiesPanelProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export default function PropertiesPanel({
  collapsed,
  onToggleCollapsed,
}: PropertiesPanelProps) {
  const {
    editMode,
    isAdmin,
    selection,
    site,
    getBlockStyles,
    updateBlockStyles,
    deviceMode,
  } = useEditor();

  if (!editMode || !isAdmin || !selection) return null;

  const styles = getBlockStyles(
    selection.pageSlug,
    selection.sectionKey,
    selection.blockKey
  );

  const block = site?.pages
    .find((p) => p.slug === selection.pageSlug)
    ?.sections.find((s) => s.sectionKey === selection.sectionKey)
    ?.blocks.find((b) => b.blockKey === selection.blockKey);

  const isTextBlock =
    block?.blockType === "text" || block?.blockType === "rich_text";

  const fontSizeNum = parseFontSize(styles.fontSize);

  const patch = (next: Partial<ElementStyles>) =>
    updateBlockStyles(
      selection.pageSlug,
      selection.sectionKey,
      selection.blockKey,
      next
    );

  if (collapsed) {
    return (
      <aside className="properties-panel properties-panel--collapsed">
        <button
          type="button"
          className="properties-panel-expand"
          onClick={onToggleCollapsed}
          title="Show properties"
        >
          <SlidersHorizontal size={18} />
          <span>Props</span>
          <ChevronLeft size={16} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="properties-panel">
      <div className="properties-panel-header">
        <h3>Properties</h3>
        <div className="properties-panel-header-actions">
          <span className="properties-device">{deviceMode}</span>
          <button
            type="button"
            className="properties-panel-minimize"
            onClick={onToggleCollapsed}
            title="Minimize properties"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <p className="properties-selection">
        {selection.sectionKey} / {selection.blockKey}
      </p>

      <div className="properties-fields">
        {isTextBlock && (
          <div className="properties-group">
            <h4 className="properties-group-title">Typography</h4>

            <label className="properties-field">
              <span>Font</span>
              <div className="properties-pills">
                {FONT_FAMILIES.map(({ label, value }) => (
                  <button
                    key={label}
                    type="button"
                    className={cn(
                      "properties-pill",
                      (styles.fontFamily ?? "") === value && "active"
                    )}
                    onClick={() => patch({ fontFamily: value || undefined })}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </label>

            <label className="properties-field">
              <span>Size — {fontSizeNum}px</span>
              <input
                type="range"
                min={10}
                max={96}
                step={1}
                value={fontSizeNum}
                className="properties-range"
                onChange={(e) => patch({ fontSize: `${e.target.value}px` })}
              />
              <div className="properties-pills properties-pills--size">
                {FONT_PRESETS.map(({ label, value }) => (
                  <button
                    key={label}
                    type="button"
                    className={cn("properties-pill", styles.fontSize === value && "active")}
                    onClick={() => patch({ fontSize: value })}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </label>

            <label className="properties-field">
              <span>Weight</span>
              <select
                value={styles.fontWeight ?? ""}
                onChange={(e) => patch({ fontWeight: e.target.value || undefined })}
              >
                <option value="">Default</option>
                <option value="400">Regular</option>
                <option value="500">Medium</option>
                <option value="600">Semibold</option>
                <option value="700">Bold</option>
              </select>
            </label>

            <label className="properties-field">
              <span>Text Color</span>
              <input
                type="color"
                value={styles.color?.startsWith("#") ? styles.color : "#1a1a1a"}
                onChange={(e) => patch({ color: e.target.value })}
              />
            </label>
          </div>
        )}

        <div className="properties-group">
          <h4 className="properties-group-title">Layout</h4>

          <label className="properties-field">
            <span>Alignment</span>
            <select
              value={styles.textAlign ?? ""}
              onChange={(e) =>
                patch({ textAlign: e.target.value as ElementStyles["textAlign"] })
              }
            >
              <option value="">Default</option>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </label>

          <label className="properties-field">
            <span>Background</span>
            <input
              type="color"
              value={
                styles.backgroundColor?.startsWith("#")
                  ? styles.backgroundColor
                  : "#faf9f7"
              }
              onChange={(e) => patch({ backgroundColor: e.target.value })}
            />
          </label>

          <label className="properties-field">
            <span>Padding</span>
            <input
              type="text"
              value={styles.padding ?? ""}
              placeholder="e.g. 12px 24px"
              onChange={(e) => patch({ padding: e.target.value || undefined })}
            />
          </label>

          <label className="properties-field">
            <span>Width</span>
            <input
              type="text"
              value={styles.width ?? ""}
              placeholder="e.g. 100%"
              onChange={(e) => patch({ width: e.target.value || undefined })}
            />
          </label>

          <label className="properties-field">
            <span>Height</span>
            <input
              type="text"
              value={styles.height ?? ""}
              placeholder="e.g. auto"
              onChange={(e) => patch({ height: e.target.value || undefined })}
            />
          </label>
        </div>
      </div>
    </aside>
  );
}
