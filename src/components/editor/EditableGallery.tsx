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
  mediaKindFromFile,
  normalizeMediaItem,
  sendBackward,
  sortByLayer,
  type MediaItem,
} from "@/cms/mediaTypes";
import { cn } from "@/lib/utils";
import { GripVertical, ImagePlus, Plus } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import MediaEditToolbar from "./MediaEditToolbar";
import MediaRenderer from "./MediaRenderer";
import type { PhotoAlbum } from "@/cms/mediaTypes";

interface EditableGalleryProps {
  albumSlug: string;
  album: PhotoAlbum;
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
      className={cn("gallery-cell-wrap", isDragging && "gallery-cell-wrap--dragging")}
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
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function EditableGallery({ albumSlug, album }: EditableGalleryProps) {
  const { site, editMode, isAdmin, updateBlockValue } = useEditor();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
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

  const handleFiles = async (files: File[], startIndex: number) => {
    if (!site || files.length === 0) return;
    setUploading(true);
    setTargetIndex(startIndex);
    try {
      const next = [...items];
      for (const [offset, file] of files.entries()) {
        const index = startIndex + offset;
        while (next.length <= index) {
          next.push({ src: "", alt: "", type: "image", zIndex: next.length });
        }
        const asset = await uploadMedia(file, site.clientId);
        next[index] = {
          src: asset.publicUrl,
          alt: file.name,
          type: mediaKindFromFile(file),
          zIndex: next[index]?.zIndex ?? index,
        };
      }
      saveImages(next);
    } finally {
      setUploading(false);
      setTargetIndex(null);
    }
  };

  const addSlot = () =>
    saveImages([...items, { src: "", alt: "", type: "image", zIndex: items.length }]);

  const removeItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    saveImages(next.length ? next : [{ src: "", alt: "", type: "image", zIndex: 0 }]);
  };

  const layerItem = (index: number, dir: "front" | "back") => {
    const next = dir === "front" ? bringForward(items, index) : sendBackward(items, index);
    saveImages(next);
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
    saveImages(next.map((item, i) => ({ ...item, zIndex: i })));
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
        inputRef.current?.click();
      }}
      onLayer={layerItem}
      onRemove={removeItem}
    />
  ));

  return (
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

      {editable && (
        <button type="button" className="gallery-add-btn" onClick={addSlot}>
          <Plus size={20} />
          Add photo / video
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="sr-only"
        onChange={(e) => {
          const selected = Array.from(e.target.files ?? []);
          if (selected.length > 0 && targetIndex !== null) {
            handleFiles(selected, targetIndex);
          }
          e.target.value = "";
        }}
      />
    </div>
  );
}
