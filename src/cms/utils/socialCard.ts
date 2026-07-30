/**
 * Social share card (og:image) helpers.
 *
 * The og:image has to be a single flattened raster file (1200x630) because
 * social crawlers do not run JavaScript. We composite it in a canvas at runtime
 * (full-bleed background photo + bottom gradient + Times italic title), then
 * upload the resulting PNG to Base44 storage so it can be used as og:image.
 */

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const OG_TITLE = "You're invited";
export const OG_DESCRIPTION =
  "Everything you need to know — our story, photos, and registry.";

/** Default background photo used for the share card. */
export const DEFAULT_OG_BACKGROUND =
  "https://media.base44.com/images/public/6a2b01575fdcdc3d21540f60/696eb7535_Screenshot2026-07-15at90111PM.png";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load background image. Check the URL."));
    img.src = src;
  });
}

/**
 * Renders the 1200x630 share card onto an offscreen canvas and returns the
 * flattened image as a PNG Blob ready to upload.
 */
export async function renderOgImageToBlob(
  backgroundUrl: string,
  title: string = OG_TITLE
): Promise<Blob> {
  const img = await loadImage(backgroundUrl);

  const canvas = document.createElement("canvas");
  canvas.width = OG_WIDTH;
  canvas.height = OG_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context is not available.");

  // 1. Full-bleed background (cover crop).
  const scale = Math.max(OG_WIDTH / img.width, OG_HEIGHT / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (OG_WIDTH - w) / 2, (OG_HEIGHT - h) / 2, w, h);

  // 2. Bottom-third dark gradient: 75% black at the very bottom -> transparent upward.
  const grad = ctx.createLinearGradient(0, OG_HEIGHT, 0, OG_HEIGHT * 0.35);
  grad.addColorStop(0, "rgba(0,0,0,0.75)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, OG_WIDTH, OG_HEIGHT);

  // 3. Title near the bottom, centered, white Times italic.
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffffff";
  ctx.font = 'italic 400 44px "Times New Roman", Times, serif';
  ctx.fillText(title, OG_WIDTH / 2, OG_HEIGHT - 70);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not encode the share card to a PNG."));
          return;
        }
        resolve(blob);
      },
      "image/png"
    );
  });
}