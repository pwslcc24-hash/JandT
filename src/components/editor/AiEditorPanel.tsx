import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Sparkles, Send, Loader2, X, Crosshair, Target } from "lucide-react";
import { useEditor } from "@/cms/context/EditorContext";
import { isBase44AiAvailable, requestAiEdits } from "@/cms/api/aiEditor";
import { pathToPageSlug } from "@/cms/ai/buildSiteSnapshot";
import { buildAiSelectionContext } from "@/cms/ai/selectionContext";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Make the hero names larger and centered",
  "Add a quote section after the explore cards",
  "Rewrite our story to sound warmer and more personal",
  "Add a dark callout box reminding guests to RSVP",
  "Change the home banner eyebrow to 'Countdown'",
];

export default function AiEditorPanel() {
  const location = useLocation();
  const {
    site,
    editMode,
    isAdmin,
    aiPanelOpen,
    setAiPanelOpen,
    aiPickMode,
    setAiPickMode,
    selection,
    setSelection,
    applyAiEdits,
  } = useEditor();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastSummary, setLastSummary] = useState("");

  if (!editMode || !isAdmin || !aiPanelOpen) return null;

  const currentPageSlug = pathToPageSlug(location.pathname);
  const targetContext = site ? buildAiSelectionContext(site, selection) : null;

  const runPrompt = async (text: string) => {
    if (!site || !text.trim()) return;
    setLoading(true);
    setError("");
    setLastSummary("");
    try {
      const result = await requestAiEdits(
        site,
        {
          currentPath: location.pathname,
          currentPageSlug,
          siteSnapshot: site,
          selection,
        },
        text.trim()
      );
      applyAiEdits(result.operations);
      setLastSummary(result.summary);
      setPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI edit failed");
    } finally {
      setLoading(false);
    }
  };

  const placeholder = targetContext
    ? `Describe how to change "${targetContext.label}"…`
    : 'Click something on the page, then describe the change — or type a general edit like "Add a quote section"';

  return (
    <aside className="ai-editor-panel">
      <div className="ai-editor-header">
        <div className="ai-editor-title">
          <Sparkles size={18} />
          <span>AI Editor</span>
        </div>
        <button type="button" className="ai-editor-close" onClick={() => setAiPanelOpen(false)}>
          <X size={18} />
        </button>
      </div>

      <p className="ai-editor-sub">
        {aiPickMode ? (
          <>
            <Crosshair size={14} className="ai-editor-inline-icon" />
            Click any text, image, card, or section on the page to target your edit.
          </>
        ) : (
          <>
            Describe what you want changed on <strong>{currentPageSlug}</strong> — text, sections,
            layout, colors, and more.
          </>
        )}
      </p>

      <div className="ai-editor-target-row">
        <button
          type="button"
          className={cn("ai-editor-pick-btn", aiPickMode && "active")}
          onClick={() => setAiPickMode(!aiPickMode)}
          title={aiPickMode ? "Pick mode on — click page elements" : "Enable pick mode"}
        >
          <Crosshair size={16} />
          {aiPickMode ? "Picking…" : "Pick on page"}
        </button>
        {targetContext ? (
          <div className="ai-editor-target-chip">
            <Target size={14} />
            <span className="ai-editor-target-label">{targetContext.label}</span>
            <button
              type="button"
              className="ai-editor-target-clear"
              onClick={() => setSelection(null)}
              aria-label="Clear selection"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <span className="ai-editor-target-empty">No target selected</span>
        )}
      </div>

      {targetContext?.preview && (
        <p className="ai-editor-target-preview">{targetContext.preview}</p>
      )}

      {!isBase44AiAvailable() && (
        <p className="ai-editor-warning">
          Add <code>VITE_BASE44_APP_ID</code> to `.env.local` to enable Base44 AI.
        </p>
      )}

      <div className="ai-editor-suggestions">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className="ai-editor-chip"
            disabled={loading}
            onClick={() => runPrompt(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="ai-editor-input-row">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          rows={3}
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              runPrompt(prompt);
            }
          }}
        />
        <button
          type="button"
          className="ai-editor-send"
          disabled={loading || !prompt.trim()}
          onClick={() => runPrompt(prompt)}
        >
          {loading ? <Loader2 size={18} className="ai-spin" /> : <Send size={18} />}
          Apply
        </button>
      </div>

      <p className="ai-editor-hint">Tip: click an element, then ⌘/Ctrl + Enter to apply</p>

      {error && <p className="ai-editor-error">{error}</p>}
      {lastSummary && <p className="ai-editor-success">✓ {lastSummary}</p>}
    </aside>
  );
}
