import { useEffect, useState } from "react";
import { useEditor } from "@/cms/context/EditorContext";
import { uploadMedia } from "@/cms/api/content";
import {
  renderOgImageToBlob,
  OG_TITLE,
  OG_DESCRIPTION,
  DEFAULT_OG_BACKGROUND,
} from "@/cms/utils/socialCard";
import SocialShareCard from "@/components/wedding/SocialShareCard";

export default function AdminSocialPreview() {
  const { site, updateSettings, publishSite, publishStatus } = useEditor();

  const storedBg = String(site?.settings?.ogBackgroundImageUrl || DEFAULT_OG_BACKGROUND);
  const [bgUrl, setBgUrl] = useState(storedBg);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState(
    String(site?.settings?.ogImageUrl || "")
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setGeneratedUrl(String(site?.settings?.ogImageUrl || ""));
  }, [site?.settings?.ogImageUrl]);

  useEffect(() => {
    setBgUrl(storedBg);
  }, [storedBg]);

  async function handleGenerate() {
    setError("");
    setBusy(true);
    setCopied(false);
    try {
      const url = bgUrl.trim() || DEFAULT_OG_BACKGROUND;
      const blob = await renderOgImageToBlob(url);
      const file = new File([blob], "og-share-card.png", { type: "image/png" });
      const asset = await uploadMedia(file, site?.clientId || "local-holdsworth");
      const publicUrl = asset.publicUrl;
      updateSettings({
        ogImageUrl: publicUrl,
        ogBackgroundImageUrl: url,
      });
      setGeneratedUrl(publicUrl);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(
        /security|taint|canvas|cors/i.test(msg)
          ? "The background image blocked canvas export (CORS). Use an image uploaded to this site's media library, then try again."
          : msg
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy() {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="admin-page">
      <h1>Social Link Preview</h1>
      <p className="admin-muted">
        Generates a flattened 1200×630 <code>og:image</code> for social shares —
        full-bleed photo, bottom gradient, and the “You’re invited” title baked
        in as a single PNG.
      </p>

      <div className="admin-cards">
        <div className="admin-card" style={{ flex: "1 1 360px" }}>
          <h2>Preview</h2>
          <p className="admin-muted" style={{ marginBottom: 16 }}>
            What the share card looks like on social platforms.
          </p>
          <SocialShareCard backgroundUrl={bgUrl || DEFAULT_OG_BACKGROUND} />
        </div>

        <div className="admin-card" style={{ flex: "1 1 320px" }}>
          <h2>Background photo</h2>
          <p className="admin-muted" style={{ marginBottom: 12 }}>
            Full-bleed background for the share card.
          </p>
          <input
            type="text"
            value={bgUrl}
            onChange={(e) => setBgUrl(e.target.value)}
            placeholder={DEFAULT_OG_BACKGROUND}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #e4e2de",
              fontSize: 13,
              marginBottom: 16,
              boxSizing: "border-box",
            }}
          />

          <button
            type="button"
            className="admin-btn"
            onClick={handleGenerate}
            disabled={busy || !site}
            style={{ opacity: busy || !site ? 0.6 : 1 }}
          >
            {busy ? "Generating…" : "Generate flattened og:image"}
          </button>

          {error && (
            <p style={{ color: "#b91c1c", marginTop: 12, fontSize: 13 }}>{error}</p>
          )}

          {generatedUrl && (
            <div style={{ marginTop: 20 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#6b6b6b",
                  marginBottom: 6,
                }}
              >
                Generated og:image URL
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  readOnly
                  value={generatedUrl}
                  onFocus={(e) => e.target.select()}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #e4e2de",
                    fontSize: 12,
                  }}
                />
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  onClick={handleCopy}
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <img
                src={generatedUrl}
                alt="Generated og preview"
                style={{
                  width: "100%",
                  marginTop: 12,
                  borderRadius: 8,
                  border: "1px solid #e4e2de",
                }}
              />

              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => publishSite()}
                disabled={publishStatus === "publishing"}
                style={{ marginTop: 12 }}
              >
                {publishStatus === "publishing"
                  ? "Publishing…"
                  : "Publish site (saves og URL)"}
              </button>

              <p className="admin-muted" style={{ marginTop: 12, fontSize: 12 }}>
                Send me this URL and I’ll bake it into the site’s{" "}
                <code>og:image</code> meta tag so platforms pick it up.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: 24 }}>
        <h2>Meta tags</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14 }}>
          <div>
            <span style={{ color: "#6b6b6b" }}>og:title — </span>
            <code>{OG_TITLE}</code>
          </div>
          <div>
            <span style={{ color: "#6b6b6b" }}>og:description — </span>
            <code>{OG_DESCRIPTION}</code>
          </div>
          <div>
            <span style={{ color: "#6b6b6b" }}>og:image size — </span>
            <code>1200 × 630</code>
          </div>
        </div>
      </div>
    </div>
  );
}