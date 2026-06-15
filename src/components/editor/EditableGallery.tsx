import { useEditor } from "@/cms/context/EditorContext";
import { uploadMedia } from "@/cms/api/content";
import { cn } from "@/lib/utils";
import { ImagePlus, Plus } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import ResizableBlock from "./ResizableBlock";
import type { PhotoAlbum } from "@/components/wedding/PhotoAlbumList";

interface EditableGalleryProps {
  albumSlug: string;
  album: PhotoAlbum;
}

export default function EditableGallery({ albumSlug, album }: EditableGalleryProps) {
  const { site, editMode, isAdmin, updateBlockValue } = useEditor();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const editable = editMode && isAdmin;

  const images = album.images?.length
    ? album.images
    : Array.from({ length: 6 }, () => ({ src: "", alt: "" }));

  const saveImages = useCallback(
    (next: { src: string; alt?: string }[]) => {
      if (!site) return;
      const page = site.pages.find((p) => p.slug === "photos");
      const block = page?.sections
        .find((s) => s.sectionKey === "photo-albums")
        ?.blocks.find((b) => b.blockKey === "photo-albums");
      const items = (block?.value?.items as PhotoAlbum[]) ?? [];
      const nextItems = items.map((a) =>
        a.slug === albumSlug ? { ...a, images: next } : a
      );
      updateBlockValue("photos", "photo-albums", "photo-albums", { items: nextItems });
    },
    [site, albumSlug, updateBlockValue]
  );

  const handleFile = async (file: File, index: number) => {
    if (!site) return;
    setUploading(true);
    try {
      const asset = await uploadMedia(file, site.clientId);
      const next = [...images];
      next[index] = { src: asset.publicUrl, alt: file.name };
      saveImages(next);
    } finally {
      setUploading(false);
      setTargetIndex(null);
    }
  };

  const addSlot = () => saveImages([...images, { src: "", alt: "" }]);

  return (
    <div className="gallery-grid">
      {images.map((img, i) => (
        <ResizableBlock
          key={i}
          pageSlug="photos"
          sectionKey="photo-albums"
          blockKey={`gallery-${albumSlug}-${i}`}
          className="gallery-cell-wrap"
        >
          <div
            className={cn("gallery-cell", editable && "gallery-cell--editable cms-editable")}
            onClick={() => {
              if (!editable) return;
              setTargetIndex(i);
              inputRef.current?.click();
            }}
            onDragOver={(e) => editable && e.preventDefault()}
            onDrop={(e) => {
              if (!editable) return;
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file?.type.startsWith("image/")) handleFile(file, i);
            }}
          >
            {img.src ? (
              <img src={img.src} alt={img.alt || album.label} loading="lazy" />
            ) : (
              <div className="gallery-placeholder">
                {editable ? (
                  <>
                    <ImagePlus size={24} />
                    <span>
                      {uploading && targetIndex === i ? "Uploading…" : "Add photo"}
                    </span>
                  </>
                ) : (
                  <span>Photo {i + 1}</span>
                )}
              </div>
            )}
          </div>
        </ResizableBlock>
      ))}

      {editable && (
        <button type="button" className="gallery-add-btn" onClick={addSlot}>
          <Plus size={20} />
          Add slot
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f && targetIndex !== null) handleFile(f, targetIndex);
          e.target.value = "";
        }}
      />
    </div>
  );
}
