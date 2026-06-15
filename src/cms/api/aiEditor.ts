import { base44 } from "@/api/base44Client";
import { appParams } from "@/lib/app-params";
import type { SiteDocument } from "../types";
import type { AiEditResult, AiOperation, AiPromptContext } from "../ai/types";
import { buildSiteSnapshot } from "../ai/buildSiteSnapshot";
import { buildAiSelectionContext, formatSelectionForPrompt } from "../ai/selectionContext";

const AI_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    summary: {
      type: "string",
      description: "Short plain-English summary of what changed",
    },
    operations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          op: {
            type: "string",
            enum: [
              "update_text",
              "update_html",
              "update_value",
              "update_styles",
              "update_settings",
              "add_section",
              "remove_section",
              "reorder_sections",
            ],
          },
          pageSlug: { type: "string" },
          sectionKey: { type: "string" },
          blockKey: { type: "string" },
          text: { type: "string" },
          html: { type: "string" },
          valueJson: {
            type: "string",
            description: "JSON object for update_value, or empty string",
          },
          stylesJson: {
            type: "string",
            description: "JSON object for update_styles, or empty string",
          },
          device: {
            type: "string",
            enum: ["desktop", "tablet", "mobile", "none"],
          },
          settingsJson: {
            type: "string",
            description: "JSON object for update_settings, or empty string",
          },
          template: {
            type: "string",
            enum: ["quote", "text-box", "callout", "banner", "none"],
          },
          afterSectionKey: { type: "string" },
          contentJson: {
            type: "string",
            description: "JSON object for add_section content, or empty string",
          },
          sectionKeysJson: {
            type: "string",
            description: "JSON array of section keys for reorder_sections, or empty string",
          },
        },
        required: [
          "op",
          "pageSlug",
          "sectionKey",
          "blockKey",
          "text",
          "html",
          "valueJson",
          "stylesJson",
          "device",
          "settingsJson",
          "template",
          "afterSectionKey",
          "contentJson",
          "sectionKeysJson",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["summary", "operations"],
  additionalProperties: false,
};

const SYSTEM_INSTRUCTIONS = `You are a wedding website editor AI. You receive the current site JSON and a user request.
Return ONLY valid operations to modify the site. Use existing pageSlug, sectionKey, and blockKey when updating content.

Pages: home (landing), info, story, photos, registry, and photo album subpages use photos page data.
Home sections: hero (hero-names, hero-lastname, hero-date, hero-video), explore (explore-label, explore-cards), banner (banner-eyebrow, banner-suffix).
Content pages use sectionKey "content" with blocks title (text) and body (rich_text html).
Story also has sectionKey "media" with block media-stack (json items array).

You CAN:
- Change any text or rich text html
- Update styles (fontSize, fontWeight, fontFamily, color, backgroundColor, padding, margin, textAlign, borderRadius, width, height)
- Add sections with templates: quote, text-box, callout, banner
- Reorder or remove custom sections (never remove hero, explore, or banner on home unless user explicitly asks)
- Update explore-cards items json, photo-albums, wedding settings

Use add_section with unique sectionKey like "quote-guests" or "details-box".
For text-box/callout/quote templates pass contentJson as a JSON string with title, body, quote, eyebrow, attribution.
For update_value pass valueJson as a JSON string (e.g. explore-cards items array).
For update_styles pass stylesJson as a JSON string and device as desktop, tablet, mobile, or none.
For add_section set unused fields to empty string and template to none when not used.
For reorder_sections pass sectionKeysJson as a JSON array string.
Use empty string for unused fields on each operation.

Prefer small targeted operations. Match the elegant wedding site tone.`;

function parseJsonField(raw: unknown, field: string): Record<string, unknown> {
  if (typeof raw !== "string" || !raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    throw new Error(`${field} must be a JSON object`);
  } catch {
    throw new Error(`AI returned invalid ${field}. Try rephrasing your request.`);
  }
}

function parseJsonArrayField(raw: unknown, field: string): string[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
    throw new Error(`${field} must be a JSON array`);
  } catch {
    throw new Error(`AI returned invalid ${field}. Try rephrasing your request.`);
  }
}

function emptyToUndefined(value: unknown): string | undefined {
  const text = String(value ?? "").trim();
  return text && text !== "none" ? text : undefined;
}

function normalizeOperations(raw: unknown[]): AiOperation[] {
  return raw.map((item) => {
    if (!item || typeof item !== "object") {
      throw new Error("AI returned an invalid operation.");
    }
    const op = item as Record<string, unknown>;

    switch (op.op) {
      case "update_text":
        return {
          op: "update_text",
          pageSlug: String(op.pageSlug),
          sectionKey: String(op.sectionKey),
          blockKey: String(op.blockKey),
          text: String(op.text),
        };
      case "update_html":
        return {
          op: "update_html",
          pageSlug: String(op.pageSlug),
          sectionKey: String(op.sectionKey),
          blockKey: String(op.blockKey),
          html: String(op.html),
        };
      case "update_value":
        return {
          op: "update_value",
          pageSlug: String(op.pageSlug),
          sectionKey: String(op.sectionKey),
          blockKey: String(op.blockKey),
          value: parseJsonField(op.valueJson, "valueJson"),
        };
      case "update_styles":
        return {
          op: "update_styles",
          pageSlug: String(op.pageSlug),
          sectionKey: String(op.sectionKey),
          blockKey: String(op.blockKey),
          styles: parseJsonField(op.stylesJson, "stylesJson"),
          device:
            op.device === "desktop" || op.device === "tablet" || op.device === "mobile"
              ? op.device
              : undefined,
        };
      case "update_settings":
        return {
          op: "update_settings",
          settings: parseJsonField(op.settingsJson, "settingsJson"),
        };
      case "add_section": {
        const template = emptyToUndefined(op.template);
        if (!template || !["quote", "text-box", "callout", "banner"].includes(template)) {
          throw new Error("AI returned add_section without a valid template.");
        }
        return {
          op: "add_section",
          pageSlug: String(op.pageSlug),
          template: template as "quote" | "text-box" | "callout" | "banner",
          sectionKey: emptyToUndefined(op.sectionKey),
          afterSectionKey: emptyToUndefined(op.afterSectionKey),
          content: parseJsonField(op.contentJson, "contentJson"),
        };
      }
      case "remove_section":
        return {
          op: "remove_section",
          pageSlug: String(op.pageSlug),
          sectionKey: String(op.sectionKey),
        };
      case "reorder_sections":
        return {
          op: "reorder_sections",
          pageSlug: String(op.pageSlug),
          sectionKeys: parseJsonArrayField(op.sectionKeysJson, "sectionKeysJson"),
        };
      default:
        throw new Error(`AI returned unknown operation: ${String(op.op)}`);
    }
  });
}

export function isBase44AiAvailable(): boolean {
  return Boolean(appParams.appId);
}

function formatAiError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as { response?: { status?: number }; message?: string };
    if (axiosErr.response?.status === 404) {
      return 'Base44 AI endpoint not found. Check VITE_BASE44_APP_ID and restart the dev server.';
    }
  }
  if (err instanceof Error) return err.message;
  return 'AI edit failed';
}

export async function requestAiEdits(
  site: SiteDocument,
  context: AiPromptContext,
  userPrompt: string
): Promise<AiEditResult> {
  if (!isBase44AiAvailable()) {
    throw new Error(
      "Base44 AI is not configured. Set VITE_BASE44_APP_ID and VITE_BASE44_APP_BASE_URL in .env.local."
    );
  }

  const snapshot = buildSiteSnapshot(site, context.currentPageSlug);
  const selectionContext = buildAiSelectionContext(site, context.selection ?? null);

  const prompt = `${SYSTEM_INSTRUCTIONS}

CURRENT PATH: ${context.currentPath}
CURRENT PAGE SLUG: ${context.currentPageSlug}

${formatSelectionForPrompt(selectionContext)}

SITE JSON:
${JSON.stringify(snapshot, null, 2)}

USER REQUEST:
${userPrompt}

Return operations to fulfill the request. Prioritize the USER SELECTED TARGET when one is set.`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    model: "gpt_5_mini",
    response_json_schema: AI_RESPONSE_SCHEMA,
  }).catch((err) => {
    throw new Error(formatAiError(err));
  });

  const parsed = response as { summary?: string; operations?: unknown[] };
  if (!parsed?.operations || !Array.isArray(parsed.operations)) {
    throw new Error("AI returned an invalid response. Try rephrasing your request.");
  }

  return {
    summary: parsed.summary ?? "Changes applied.",
    operations: normalizeOperations(parsed.operations),
  };
}
