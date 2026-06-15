import { useEffect, useState } from "react";
import { useEditor } from "@/cms/context/EditorContext";
import { listMedia, uploadMedia } from "@/cms/api/content";
import type { MediaAsset } from "@/cms/types";

export default function AdminMedia() {
  const { site } = useEditor();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (site?.clientId) listMedia(site.clientId).then(setAssets);
  }, [site?.clientId]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !site) return;
    setUploading(true);
    try {
      const asset = await uploadMedia(file, site.clientId);
      setAssets((prev) => [asset, ...prev]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Media Library</h1>
        <label className="admin-btn">
          {uploading ? "Uploading…" : "Upload Image"}
          <input type="file" accept="image/*" hidden onChange={onUpload} />
        </label>
      </div>
      <p className="admin-muted">Drag-and-drop uploads are optimized automatically.</p>
      <div className="admin-media-grid">
        {assets.length === 0 ? (
          <p className="admin-muted">No media yet. Upload images to get started.</p>
        ) : (
          assets.map((a) => (
            <div key={a.id} className="admin-media-item">
              <img src={a.publicUrl} alt={a.altText || a.fileName} loading="lazy" />
              <span>{a.fileName}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
