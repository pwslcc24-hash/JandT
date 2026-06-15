import type { DeviceMode, EditorSelection, ElementStyles } from "../types";

export type AiOperation =
  | {
      op: "update_text";
      pageSlug: string;
      sectionKey: string;
      blockKey: string;
      text: string;
    }
  | {
      op: "update_html";
      pageSlug: string;
      sectionKey: string;
      blockKey: string;
      html: string;
    }
  | {
      op: "update_value";
      pageSlug: string;
      sectionKey: string;
      blockKey: string;
      value: Record<string, unknown>;
    }
  | {
      op: "update_styles";
      pageSlug: string;
      sectionKey: string;
      blockKey: string;
      styles: ElementStyles;
      device?: DeviceMode;
    }
  | {
      op: "update_settings";
      settings: Record<string, unknown>;
    }
  | {
      op: "add_section";
      pageSlug: string;
      template: "quote" | "text-box" | "callout" | "banner";
      afterSectionKey?: string;
      sectionKey?: string;
      content?: Record<string, string>;
    }
  | {
      op: "remove_section";
      pageSlug: string;
      sectionKey: string;
    }
  | {
      op: "reorder_sections";
      pageSlug: string;
      sectionKeys: string[];
    };

export interface AiEditResult {
  summary: string;
  operations: AiOperation[];
}

export interface AiPromptContext {
  currentPath: string;
  currentPageSlug: string;
  siteSnapshot: unknown;
  selection: EditorSelection | null;
}
