import { useEditor } from "@/cms/context/EditorContext";
import { uploadMedia } from "@/cms/api/content";
import { mediaKindFromFile, type MediaKind } from "@/cms/mediaTypes";
import { cn } from "@/lib/utils";
import { Film, ImagePlus } from "lucide-react";
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

  const page = site?.pages.find((p) => p.slug === pageSlug);
  const section = page?.sections.find((s) => s.sectionKey === sectionKey);
  const block = section?.blocks.find((b) => b.blockKey === blockKey);
  const url = String(block?.value?.url ?? fallbackUrl);
  const mediaType = (block?.value?.mediaType as MediaKind) ?? fallbackType;
  const editable = editMode && isAdmin;

  const openPicker = () => {
    if (!editable) return;
    inputRef.current?.click();
  };

  const handleFile = useCallback(
    async (file: File) => {
      if (!site) return;
      setUploading(true);
      try {
        const asset = await uploadMedia(file, site.clientId);
        updateBlockValue(pageSlug, sectionKey, blockKey, {
          url: asset.publicUrl,
          mediaType: mediaKindFromFile(file),
          alt: file.name,
        });
      } finally {
        setUploading(false);
      }
    },
    [site, updateBlockValue, pageSlug, sectionKey, blockKey]
  );

  const onDrop = (e: React.DragEvent) => {
    if (!editable) return;
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith("image/") || file.type.startsWith("video/"))) {
      handleFile(file);
    }
  };

  return (
    <ResizableBlock
      pageSlug={pageSlug}
      sectionKey={sectionKey}
      blockKey={blockKey}
      blockId={block?.id}
      className={cn("cms-editable-media-wrap", className)}
    >
      <div
        className={cn(
          "cms-editable-media",
          variant === "background" && "cms-editable-media--bg",
          editable && "cms-editable cms-editable-media--editable"
        )}
        onClick={openPicker}
        onDragOver={(e) => editable && e.preventDefault()}
        onDrop={onDrop}
        role={editable ? "button" : undefined}
        tabIndex={editable ? 0 : undefined}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
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
          <div className="cms-image-overlay cms-media-overlay">
            {uploading ? (
              <span>Uploading…</span>
            ) : (
              <>
                <ImagePlus size={22} />
                <span>{url ? "Tap to replace" : "Drop photo or video"}</span>
              </>
            )}
          </div>
        )}
      </div>
    </ResizableBlock>
  );
}
