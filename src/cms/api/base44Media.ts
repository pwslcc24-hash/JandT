import { base44 } from "@/api/base44Client";
import { isBase44PublishAvailable } from "./publish";

interface UploadFileResponse {
  file_url?: string;
  url?: string;
}

export function isDataUrl(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("data:");
}

export async function uploadBlobToBase44(
  blob: Blob,
  fileName: string,
  mimeType: string
): Promise<string> {
  if (!isBase44PublishAvailable()) {
    throw new Error("Base44 is not configured for media upload.");
  }

  const file =
    blob instanceof File ? blob : new File([blob], fileName, { type: mimeType || blob.type });

  const response = (await base44.integrations.Core.UploadFile({ file })) as UploadFileResponse;

  const url = response?.file_url ?? response?.url;
  if (!url) {
    throw new Error("Base44 upload did not return a file URL.");
  }
  return url;
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

function mimeFromDataUrl(dataUrl: string): string {
  const match = dataUrl.match(/^data:([^;,]+)/);
  return match?.[1] ?? "application/octet-stream";
}

function extensionFromMime(mime: string): string {
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";
  if (mime.includes("mp4")) return "mp4";
  if (mime.includes("webm")) return "webm";
  if (mime.includes("quicktime") || mime.includes("mov")) return "mov";
  if (mime.includes("photoshop") || mime.includes("psd")) return "psd";
  return "bin";
}

async function replaceInlineMedia(value: unknown, path = "asset"): Promise<unknown> {
  if (isDataUrl(value)) {
    const mime = mimeFromDataUrl(value);
    const blob = await dataUrlToBlob(value);
    const ext = extensionFromMime(mime);
    return uploadBlobToBase44(blob, `${path}-${Date.now()}.${ext}`, mime);
  }

  if (Array.isArray(value)) {
    return Promise.all(value.map((item, index) => replaceInlineMedia(item, `${path}-${index}`)));
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const next: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(record)) {
      next[key] = await replaceInlineMedia(child, `${path}-${key}`);
    }
    return next;
  }

  return value;
}

export async function externalizeInlineMedia<T>(doc: T): Promise<T> {
  if (!isBase44PublishAvailable()) return doc;
  return replaceInlineMedia(doc) as Promise<T>;
}

export function estimateDocumentBytes(doc: unknown): number {
  return new Blob([JSON.stringify(doc)]).size;
}

export function documentHasInlineMedia(doc: unknown): boolean {
  const json = JSON.stringify(doc);
  return json.includes("data:image") || json.includes("data:video");
}