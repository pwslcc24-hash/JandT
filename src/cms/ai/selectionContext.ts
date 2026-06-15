import type { EditorSelection, SiteDocument } from "../types";

export interface AiSelectionContext {
  pageSlug: string;
  sectionKey: string;
  blockKey: string;
  sectionId?: string;
  targetType: "block" | "section";
  blockType?: string;
  label: string;
  preview: string;
  currentValue?: Record<string, unknown>;
  currentStyles?: Record<string, unknown>;
}

export function buildAiSelectionContext(
  site: SiteDocument,
  selection: EditorSelection | null
): AiSelectionContext | null {
  if (!selection) return null;

  const page = site.pages.find((p) => p.slug === selection.pageSlug);
  const section = page?.sections.find((s) => s.sectionKey === selection.sectionKey);
  if (!section) return null;

  if (selection.targetType === "section" || !selection.blockKey) {
    return {
      pageSlug: selection.pageSlug,
      sectionKey: selection.sectionKey,
      blockKey: "",
      sectionId: selection.sectionId ?? section.id,
      targetType: "section",
      blockType: section.sectionType,
      label: selection.label ?? `${selection.pageSlug} / ${selection.sectionKey} section`,
      preview: `${section.blocks.length} blocks · type ${section.sectionType}`,
      currentStyles: section.styles,
    };
  }

  const block = section.blocks.find((b) => b.blockKey === selection.blockKey);
  if (!block) return null;

  let preview = "";
  if (block.blockType === "text") {
    preview = String(block.value.text ?? "").slice(0, 200);
  } else if (block.blockType === "rich_text") {
    preview = String(block.value.html ?? "")
      .replace(/<[^>]+>/g, " ")
      .slice(0, 200);
  } else if (block.blockType === "image") {
    preview = block.value.url ? "Media uploaded" : "Empty media slot";
  } else if (block.blockType === "json") {
    const items = block.value?.items;
    if (Array.isArray(items) && typeof selection.meta?.cardIndex === "number") {
      const card = items[selection.meta.cardIndex as number];
      preview = card
        ? `Explore card #${selection.meta.cardIndex}: ${card.label ?? card.slug ?? "untitled"}`
        : JSON.stringify(block.value).slice(0, 200);
    } else {
      preview = JSON.stringify(block.value).slice(0, 200);
    }
  }

  const metaNote =
    selection.meta && Object.keys(selection.meta).length > 0
      ? ` · ${JSON.stringify(selection.meta)}`
      : "";

  return {
    pageSlug: selection.pageSlug,
    sectionKey: selection.sectionKey,
    blockKey: selection.blockKey,
    sectionId: section.id,
    targetType: "block",
    blockType: block.blockType,
    label:
      selection.label ??
      `${selection.pageSlug} / ${selection.sectionKey} / ${selection.blockKey}`,
    preview: preview + metaNote,
    currentValue: block.value,
    currentStyles: block.styles,
  };
}

export function formatSelectionForPrompt(ctx: AiSelectionContext | null): string {
  if (!ctx) {
    return "USER SELECTED TARGET: none — apply changes to the current page generally.";
  }

  return `USER SELECTED TARGET (prioritize edits here unless user asks otherwise):
- Path: pageSlug="${ctx.pageSlug}", sectionKey="${ctx.sectionKey}"${
    ctx.blockKey ? `, blockKey="${ctx.blockKey}"` : ""
  }
- Type: ${ctx.targetType}${ctx.blockType ? ` / ${ctx.blockType}` : ""}
- Label: ${ctx.label}
- Current preview: ${ctx.preview || "(empty)"}
${ctx.currentValue ? `- Current value: ${JSON.stringify(ctx.currentValue)}` : ""}
${ctx.currentStyles ? `- Current styles: ${JSON.stringify(ctx.currentStyles)}` : ""}`;
}
