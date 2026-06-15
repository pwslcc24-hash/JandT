import { useEditor } from "@/cms/context/EditorContext";
import type { ElementStyles } from "@/cms/types";

const STYLE_FIELDS: { key: keyof ElementStyles; label: string; type?: string }[] = [
  { key: "fontSize", label: "Font Size", type: "text" },
  { key: "fontWeight", label: "Font Weight", type: "text" },
  { key: "color", label: "Text Color", type: "color" },
  { key: "backgroundColor", label: "Background", type: "color" },
  { key: "borderRadius", label: "Border Radius", type: "text" },
  { key: "padding", label: "Padding", type: "text" },
  { key: "margin", label: "Margin", type: "text" },
  { key: "width", label: "Width", type: "text" },
  { key: "height", label: "Height", type: "text" },
];

export default function PropertiesPanel() {
  const {
    editMode,
    isAdmin,
    selection,
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

  return (
    <aside className="properties-panel">
      <div className="properties-panel-header">
        <h3>Properties</h3>
        <span className="properties-device">{deviceMode}</span>
      </div>
      <p className="properties-selection">
        {selection.sectionKey} / {selection.blockKey}
      </p>

      <div className="properties-fields">
        <label className="properties-field">
          <span>Alignment</span>
          <select
            value={styles.textAlign ?? ""}
            onChange={(e) =>
              updateBlockStyles(
                selection.pageSlug,
                selection.sectionKey,
                selection.blockKey,
                { textAlign: e.target.value as ElementStyles["textAlign"] }
              )
            }
          >
            <option value="">Default</option>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>

        {STYLE_FIELDS.map(({ key, label, type }) => (
          <label key={key} className="properties-field">
            <span>{label}</span>
            <input
              type={type ?? "text"}
              value={styles[key] ?? ""}
              placeholder="—"
              onChange={(e) =>
                updateBlockStyles(
                  selection.pageSlug,
                  selection.sectionKey,
                  selection.blockKey,
                  { [key]: e.target.value }
                )
              }
            />
          </label>
        ))}
      </div>
    </aside>
  );
}
