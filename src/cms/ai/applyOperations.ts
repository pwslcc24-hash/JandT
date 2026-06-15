import type { SiteDocument } from "../types";
import type { AiOperation } from "./types";
import { createSectionFromTemplate } from "./sectionTemplates";

function findPage(doc: SiteDocument, slug: string) {
  return doc.pages.find((p) => p.slug === slug);
}

function findSection(doc: SiteDocument, pageSlug: string, sectionKey: string) {
  const page = findPage(doc, pageSlug);
  return page?.sections.find((s) => s.sectionKey === sectionKey);
}

function findBlock(
  doc: SiteDocument,
  pageSlug: string,
  sectionKey: string,
  blockKey: string
) {
  const section = findSection(doc, pageSlug, sectionKey);
  return section?.blocks.find((b) => b.blockKey === blockKey);
}

function styleKey(device?: string) {
  if (device === "tablet") return "stylesTablet" as const;
  if (device === "mobile") return "stylesMobile" as const;
  return "styles" as const;
}

export function applyAiOperations(doc: SiteDocument, operations: AiOperation[]): SiteDocument {
  const next = structuredClone(doc);

  for (const operation of operations) {
    switch (operation.op) {
      case "update_text": {
        const block = findBlock(next, operation.pageSlug, operation.sectionKey, operation.blockKey);
        if (block) block.value.text = operation.text;
        break;
      }
      case "update_html": {
        const block = findBlock(next, operation.pageSlug, operation.sectionKey, operation.blockKey);
        if (block) block.value.html = operation.html;
        break;
      }
      case "update_value": {
        const block = findBlock(next, operation.pageSlug, operation.sectionKey, operation.blockKey);
        if (block) block.value = { ...block.value, ...operation.value };
        break;
      }
      case "update_styles": {
        const block = findBlock(next, operation.pageSlug, operation.sectionKey, operation.blockKey);
        if (block) {
          const key = styleKey(operation.device);
          block[key] = { ...block[key], ...operation.styles };
        }
        break;
      }
      case "update_settings": {
        next.settings = { ...next.settings, ...operation.settings };
        break;
      }
      case "add_section": {
        const page = findPage(next, operation.pageSlug);
        if (!page) break;
        const sectionKey =
          operation.sectionKey ??
          `${operation.template}-${Date.now().toString(36).slice(-4)}`;
        const sortOrder = page.sections.length;
        const section = createSectionFromTemplate(
          operation.template,
          sectionKey,
          sortOrder,
          operation.content
        );

        if (operation.afterSectionKey) {
          const after = page.sections.find((s) => s.sectionKey === operation.afterSectionKey);
          if (after) {
            section.sortOrder = after.sortOrder + 0.5;
          }
        }

        page.sections.push(section);
        page.sections = [...page.sections].sort((a, b) => a.sortOrder - b.sortOrder);
        page.sections.forEach((s, i) => {
          s.sortOrder = i;
        });
        break;
      }
      case "remove_section": {
        const page = findPage(next, operation.pageSlug);
        if (!page) break;
        page.sections = page.sections.filter((s) => s.sectionKey !== operation.sectionKey);
        page.sections.forEach((s, i) => {
          s.sortOrder = i;
        });
        break;
      }
      case "reorder_sections": {
        const page = findPage(next, operation.pageSlug);
        if (!page) break;
        operation.sectionKeys.forEach((key, index) => {
          const section = page.sections.find((s) => s.sectionKey === key);
          if (section) section.sortOrder = index;
        });
        page.sections = [...page.sections].sort((a, b) => a.sortOrder - b.sortOrder);
        break;
      }
      default:
        break;
    }
  }

  next.updatedAt = new Date().toISOString();
  return next;
}
