import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEditor } from "@/cms/context/EditorContext";
import { uploadMedia } from "@/cms/api/content";
import {
  bringForward,
  isMediaFile,
  mediaKindFromFile,
  normalizeMediaItem,
  sendBackward,
  type GalleryTileSize,
  type MediaItem,
} from "@/cms/mediaTypes";
import { cn } from "@/lib/utils";
import { GripVertical, ImagePlus, Plus, Trash2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import MediaEditToolbar from "./MediaEditToolbar";
import MediaRenderer from "./MediaRenderer";
import type { PhotoAlbum } from "@/cms/mediaTypes";

interface EditableGalleryProps {
  albumSlug: string;
  album: PhotoAlbum;
}

const TILE_SIZE_OPTIONS: Array<{ value: GalleryTileSize; label: string }> = [
  { value: "small", label: "S" },
  { value: "wide", label: "W" },
  { value: "tall", label: "T" },
  { value: "large", label: "L" },
];

const TILE_SIZE_PATTERN: GalleryTileSize[] = [
  "small",
  "small",
  "wide",
  "small",
  "tall",
  "small",
  "large",
  "small",
];

interface UploadedMedia {
  file: File;
  publicUrl: string;
}

function suggestTileSize(index: number): GalleryTileSize {
  return TILE_SIZE_PATTERN[index % TILE_SIZE_PATTERN.length] ?? "small";
}

function createMediaItem(
  file: File,
  publicUrl: string,
  index: number,
  previous?: MediaItem
): MediaItem {
  return {
    src: publicUrl,
    alt: file.name,
    type: mediaKindFromFile(file),
    zIndex: index,
    tileSize: previous?.tileSize ?? suggestTileSize(index),
  };
}

function SortableMediaCell({
  item,
  index,
  albumLabel,
  editable,
  uploading,
  targetIndex,
  onPick,
  onLayer,
  onRemove,
  onResize,
}: {
  item: MediaItem;
  index: number;
  albumLabel: string;
  editable: boolean;
  uploading: boolean;
  targetIndex: number | null;
  onPick: (index: number) => void;
  onLayer: (index: number, dir: "front" | "back") => void;
  onRemove: (index: number) => void;
  onResize: (index: number, size: GalleryTileSize) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `media-${index}`,
    disabled: !editable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: item.zIndex ?? index,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "gallery-cell-wrap",
        `gallery-cell-wrap--${item.tileSize ?? "small"}`,
        isDragging && "gallery-cell-wrap--dragging"
      )}
    >
      <div
        className={cn("gallery-cell", editable && "gallery-cell--editable cms-editable")}
        onClick={() => editable && onPick(index)}
      >
        {item.src ? (
          <MediaRenderer src={item.src} type={item.type} alt={item.alt || albumLabel} />
        ) : (
          <div className="gallery-placeholder">
            {editable ? (
              <>
                <ImagePlus size={24} />
                <span>{uploading && targetIndex === index ? "Uploading…" : "Add photo or video"}</span>
              </>
            ) : (
              <span>Photo {index + 1}</span>
            )}
          </div>
        )}
        {editable && (
          <>
            <button
              type="button"
              className="gallery-drag-handle"
              {...attributes}
              {...listeners}
              aria-label="Drag to reorder"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical size={16} />
            </button>
            {item.src && (
              <MediaEditToolbar
                uploading={uploading && targetIndex === index}
                onReplace={() => onPick(index)}
                onBringFront={() => onLayer(index, "front")}
                onSendBack={() => onLayer(index, "back")}
                onRemove={() => onRemove(index)}
              >
                <div className="gallery-size-controls">
                  {TILE_SIZE_OPTIONS.map((option) => (
                    <button
                      key={`${index}-${option.value}`}
                      type="button"
                      className={cn(
                        "gallery-size-btn",
                        item.tileSize === option.value && "gallery-size-btn--active"
                      )}
                      title={`Resize to ${option.value}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onResize(index, option.value);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </MediaEditToolbar>
            )}
            {item.src && (
              <button
                type="button"
                className="gallery-remove-chip"
                title="Remove photo"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
              >
                <Trash2 size={12} />
                Remove
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function EditableGallery({ albumSlug, album }: EditableGalleryProps) {
  const { site, editMode, isAdmin, updateBlockValue } = useEditor();
  const singleInputRef = useRef<HTMLInputElement>(null);
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [uploadDone, setUploadDone] = useState(0);
  const [uploadFailed, setUploadFailed] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const editable = editMode && isAdmin;

  const rawImages = album.images?.length
    ? album.images
    : [{ src: "", alt: "", type: "image" as const, zIndex: 0 }];

  const items = rawImages.map(normalizeMediaItem);

  const saveImages = useCallback(
    (next: MediaItem[]) => {
      if (!site) return;
      const page = site.pages.find((p) => p.slug === "photos");
      const block = page?.sections
        .find((s) => s.sectionKey === "photo-albums")
        ?.blocks.find((b) => b.blockKey === "photo-albums");
      const albums = (block?.value?.items as PhotoAlbum[]) ?? [];
      const nextAlbums = albums.map((a) =>
        a.slug === albumSlug ? { ...a, images: next } : a
      );
      updateBlockValue("photos", "photo-albums", "photo-albums", { items: nextAlbums });
    },
    [site, albumSlug, updateBlockValue]
  );

  const uploadFiles = async (files: File[], replaceIndex: number | null) => {
    if (!site || files.length === 0) return;
    const mediaFiles = files.filter(isMediaFile);
    if (!mediaFiles.length) {
      setUploadError("No supported files found. Please choose images or videos.");
      return;
    }

    setUploadError(null);
    setUploading(true);
    setUploadFailed(0);
    setUploadDone(0);
    setUploadTotal(mediaFiles.length);

    try {
      let cursor = 0;
      let done = 0;
      let failed = 0;
      const uploaded: UploadedMedia[] = [];

      const worker = async () => {
        while (cursor < mediaFiles.length) {
          const nextIndex = cursor;
          cursor += 1;
          const file = mediaFiles[nextIndex];
          if (!file) continue;
          try {
            const asset = await uploadMedia(file, site.clientId);
            uploaded[nextIndex] = { file, publicUrl: asset.publicUrl };
          } catch (err) {
            console.warn("[gallery] upload failed", file.name, err);
            failed += 1;
          } finally {
            done += 1;
            setUploadDone(done);
          }
        }
      };

      const concurrency = Math.min(4, mediaFiles.length);
      await Promise.all(Array.from({ length: concurrency }, () => worker()));

      const successful = uploaded.filter(Boolean);
      setUploadFailed(failed);

      if (!successful.length) {
        setUploadError("Upload failed. Please try again.");
        return;
      }

      const next = [...items];
      let pointer = replaceIndex;

      const onlyPlaceholder =
        next.length === 1 &&
        !next[0]?.src &&
        (next[0]?.tileSize ?? "small") === "small";

      if (pointer === null && onlyPlaceholder) {
        pointer = 0;
      }

      successful.forEach((entry, position) => {
        if (pointer !== null && position === 0) {
          const existing = next[pointer];
          next[pointer] = createMediaItem(entry.file, entry.publicUrl, pointer, existing);
          return;
        }
        const insertAt = next.length;
        next.push(createMediaItem(entry.file, entry.publicUrl, insertAt));
      });
      saveImages(next);

      if (failed > 0) {
        setUploadError(`${failed} file${failed > 1 ? "s" : ""} failed to upload.`);
      }
    } finally {
      setUploading(false);
      setTargetIndex(null);
    }
  };

  const addSlot = () =>
    saveImages([
      ...items,
      {
        src: "",
        alt: "",
        type: "image",
        zIndex: items.length,
        tileSize: "small",
      },
    ]);

  const removeItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    saveImages(
      next.length
        ? next
        : [{ src: "", alt: "", type: "image", zIndex: 0, tileSize: "small" }]
    );
  };

  const layerItem = (index: number, dir: "front" | "back") => {
    const next = dir === "front" ? bringForward(items, index) : sendBackward(items, index);
    saveImages(next);
  };

  const resizeItem = (index: number, size: GalleryTileSize) => {
    saveImages(items.map((item, i) => (i === index ? { ...item, tileSize: size } : item)));
  };

  const autoMixTileSizes = () => {
    saveImages(
      items.map((item, index) => ({
        ...item,
        tileSize: item.src ? suggestTileSize(index) : "small",
      }))
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((_, i) => `media-${i}` === active.id);
    const newIndex = items.findIndex((_, i) => `media-${i}` === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = [...items];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    saveImages(next);
  };

  const sortIds = items.map((_, i) => `media-${i}`);

  const grid = items.map((item, i) => (
    <SortableMediaCell
      key={`${albumSlug}-${i}-${item.src}`}
      item={item}
      index={i}
      albumLabel={album.label}
      editable={editable}
      uploading={uploading}
      targetIndex={targetIndex}
      onPick={(idx) => {
        setTargetIndex(idx);
        singleInputRef.current?.click();
      }}
      onLayer={layerItem}
      onRemove={removeItem}
      onResize={resizeItem}
    />
  ));

  return (
    <div className="gallery-editor">
      {editable && (
        <div className="gallery-editor-controls">
          <button
            type="button"
            className="gallery-editor-btn"
            onClick={() => {
              setTargetIndex(null);
              bulkInputRef.current?.click();
            }}
            disabled={uploading}
          >
            <ImagePlus size={16} />
            Import photos/videos
          </button>
          <button
            type="button"
            className="gallery-editor-btn gallery-editor-btn--secondary"
            onClick={addSlot}
            disabled={uploading}
          >
            <Plus size={16} />
            Add empty slot
          </button>
          <button
            type="button"
            className="gallery-editor-btn gallery-editor-btn--secondary"
            onClick={autoMixTileSizes}
            disabled={uploading}
          >
            Mix tile sizes
          </button>
          <span className="gallery-editor-hint">
            {uploading
              ? `Uploading ${uploadDone}/${uploadTotal}…`
              : "Tip: Select hundreds of files at once from your file picker."}
          </span>
        </div>
      )}
      {uploadError && <p className="gallery-upload-error">{uploadError}</p>}
      {!uploading && uploadFailed > 0 && !uploadError && (
        <p className="gallery-upload-error">
          {uploadFailed} file{uploadFailed > 1 ? "s" : ""} could not be uploaded.
        </p>
      )}
      <div className="gallery-grid">
      {editable ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={sortIds} strategy={rectSortingStrategy}>
            {grid}
          </SortableContext>
        </DndContext>
      ) : (
        grid
      )}
      </div>

      <input
        ref={singleInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="sr-only"
        onChange={(e) => {
          const selected = Array.from(e.target.files ?? []);
          if (selected.length > 0 && targetIndex !== null) {
            void uploadFiles(selected, targetIndex);
          }
          e.target.value = "";
        }}
      />
      <input
        ref={bulkInputRef}
        type="file"
        accept="image/*,video/*"
        className="sr-only"
        multiple
        onChange={(e) => {
          const selectedFiles = Array.from(e.target.files ?? []);
          if (selectedFiles.length) {
            void uploadFiles(selectedFiles, null);
          }
          e.target.value = "";
        }}
      />
    </div>
  );
}
