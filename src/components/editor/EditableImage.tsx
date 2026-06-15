import { useEditor } from "@/cms/context/EditorContext";
import { uploadMedia } from "@/cms/api/content";
import { cn } from "@/lib/utils";
import { ImagePlus } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import ResizableBlock from "./ResizableBlock";

interface EditableImageProps {
  pageSlug: string;
  sectionKey: string;
  blockKey: string;
  fallbackUrl?: string;
  className?: string;
  imgClassName?: string;
  alt?: string;
  children?: React.ReactNode;
}

export default function EditableImage({
  pageSlug,
  sectionKey,
  blockKey,
  fallbackUrl = "",
  className,
  imgClassName,
  alt = "",
  children,
}: EditableImageProps) {
  const { site, editMode, isAdmin, updateBlockValue } = useEditor();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const page = site?.pages.find((p) => p.slug === pageSlug);
  const section = page?.sections.find((s) => s.sectionKey === sectionKey);
  const block = section?.blocks.find((b) => b.blockKey === blockKey);
  const url = String(block?.value?.url ?? fallbackUrl);
  const editable = editMode && isAdmin;

  const handleClick = () => {
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
    if (file?.type.startsWith("image/")) handleFile(file);
  };

  return (
    <ResizableBlock
      pageSlug={pageSlug}
      sectionKey={sectionKey}
      blockKey={blockKey}
      blockId={block?.id}
      className={cn("cms-editable-image-wrap", className)}
    >
      <div
        className={cn(editable && "cms-editable-image cms-editable")}
        onClick={handleClick}
        onDragOver={(e) => editable && e.preventDefault()}
        onDrop={onDrop}
        role={editable ? "button" : undefined}
        tabIndex={editable ? 0 : undefined}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        {url ? (
          <img src={url} alt={alt || String(block?.value?.alt ?? "")} className={imgClassName} />
        ) : (
          children
        )}
        {editable && (
          <div className="cms-image-overlay">
            {uploading ? (
              <span>Uploading…</span>
            ) : (
              <>
                <ImagePlus size={24} />
                <span>Click or drop to replace</span>
              </>
            )}
          </div>
        )}
      </div>
    </ResizableBlock>
  );
}
