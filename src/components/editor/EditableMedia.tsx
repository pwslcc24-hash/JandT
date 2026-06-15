import { useEditor } from "@/cms/context/EditorContext";
import { useEditorTarget } from "@/cms/hooks/useEditorTarget";
import { uploadMedia } from "@/cms/api/content";
import { MEDIA_ACCEPT, mediaKindFromFile, isMediaFile, type MediaKind } from "@/cms/mediaTypes";
import { cn } from "@/lib/utils";
import { Film, ImagePlus, Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import ResizableBlock from "./ResizableBlock";
import MediaRenderer from "./MediaRenderer";

interface EditableMediaProps {
  pageSlug: string;
  sectionKey: string;
  blockKey: string;
  fallbackUrl?: string;
  fallbackType?: MediaKind;
  className?: string;
  mediaClassName?: string;
  alt?: string;
  variant?: "background" | "inline";
  children?: React.ReactNode;
}

export default function EditableMedia({
  pageSlug,
  sectionKey,
  blockKey,
  fallbackUrl = "",
  fallbackType = "image",
  className,
  mediaClassName,
  alt = "",
  variant = "background",
  children,
}: EditableMediaProps) {
  const { site, editMode, isAdmin, updateBlockValue } = useEditor();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const page = site?.pages.find((p) => p.slug === pageSlug);
  const section = page?.sections.find((s) => s.sectionKey === sectionKey);
  const block = section?.blocks.find((b) => b.blockKey === blockKey);
  const url = String(block?.value?.url ?? fallbackUrl);
  const mediaType = (block?.value?.mediaType as MediaKind) ?? fallbackType;
  const editable = editMode && isAdmin;
  const isBackground = variant === "background";

  const { targetClass, handleTargetPointer, aiPickMode } = useEditorTarget({
    pageSlug,
    sectionKey,
    blockKey,
    blockId: block?.id,
    label: `${sectionKey} / ${blockKey}`,
  });

  const openPicker = (e?: React.MouseEvent) => {
    if (e && handleTargetPointer(e)) return;
    e?.stopPropagation();
    if (!editable || aiPickMode) return;
    setError("");
    inputRef.current?.click();
  };

  const handleFile = useCallback(
    async (file: File) => {
      if (!site || !file) return;
      if (!isMediaFile(file)) {
        setError("Please choose a photo or video file.");
        return;
      }
      setUploading(true);
      setError("");
      try {
        const asset = await uploadMedia(file, site.clientId);
        updateBlockValue(pageSlug, sectionKey, blockKey, {
          url: asset.publicUrl,
          mediaType: mediaKindFromFile(file),
          alt: file.name,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed. Try a smaller file.");
      } finally {
        setUploading(false);
      }
    },
    [site, updateBlockValue, pageSlug, sectionKey, blockKey]
  );

  const onDrop = (e: React.DragEvent) => {
    if (!editable || aiPickMode) return;
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const inner = (
    <div
      className={cn(
        "cms-editable-media",
        isBackground && "cms-editable-media--bg",
        editable && "cms-editable-media--editable",
        editable && !url && "cms-editable-media--empty",
        targetClass
      )}
      onClick={openPicker}
      onDragOver={(e) => editable && e.preventDefault()}
      onDrop={onDrop}
      role={editable ? "button" : undefined}
      tabIndex={editable ? 0 : undefined}
      onKeyDown={(e) => {
        if (editable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          openPicker();
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={MEDIA_ACCEPT}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      {url ? (
        <MediaRenderer
          src={url}
          type={mediaType}
          alt={alt || String(block?.value?.alt ?? "")}
          className={mediaClassName}
        />
      ) : (
        children ?? (
          <div className="cms-media-empty">
            <Film size={28} strokeWidth={1.5} />
            <span>Add photo or video</span>
          </div>
        )
      )}
      {editable && (
        <div
          className={cn(
            "cms-media-overlay",
            !url && "cms-media-overlay--always"
          )}
        >
          {uploading ? (
            <span>Uploading…</span>
          ) : (
            <>
              <Upload size={22} />
              <span className="cms-media-overlay-title">
                {url ? "Replace background" : "Upload photo or video"}
              </span>
              <span className="cms-media-overlay-sub">
                Click, tap, or drag & drop · MP4, MOV, WebM
              </span>
              {!url && (
                <button type="button" className="cms-media-upload-btn" onClick={openPicker}>
                  <ImagePlus size={16} />
                  Choose file
                </button>
              )}
              {error && <span className="cms-media-overlay-error">{error}</span>}
            </>
          )}
        </div>
      )}
    </div>
  );

  if (isBackground) {
    return (
      <div className={cn("cms-editable-media-wrap cms-editable-media-wrap--bg", className)}>
        {inner}
      </div>
    );
  }

  return (
    <ResizableBlock
      pageSlug={pageSlug}
      sectionKey={sectionKey}
      blockKey={blockKey}
      blockId={block?.id}
      className={cn("cms-editable-media-wrap", className)}
    >
      {inner}
    </ResizableBlock>
  );
}
