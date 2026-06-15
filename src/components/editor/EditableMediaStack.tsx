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
import { getJson } from "@/cms/seed/defaultSite";
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

interface EditableMediaStackProps {
  pageSlug: string;
}

function StackCell({
  item,
  index,
  editable,
  uploading,
  targetIndex,
  onPick,
  onLayer,
  onRemove,
}: {
  item: MediaItem;
  index: number;
  editable: boolean;
  uploading: boolean;
  targetIndex: number | null;
  onPick: (index: number) => void;
  onLayer: (index: number, dir: "front" | "back") => void;
  onRemove: (index: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `stack-${index}`,
    disabled: !editable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: item.zIndex ?? index + 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("media-stack-item", isDragging && "media-stack-item--dragging")}
    >
      <div
        className={cn("media-stack-cell", editable && "media-stack-cell--editable")}
        onClick={() => editable && onPick(index)}
      >
        {item.src ? (
          <MediaRenderer src={item.src} type={item.type} alt={item.alt || "Story media"} />
        ) : (
          <div className="media-stack-placeholder">
            <ImagePlus size={22} />
            <span>{uploading && targetIndex === index ? "Uploading…" : "Add photo or video"}</span>
          </div>
        )}
        {editable && item.src && (
          <>
            <button
              type="button"
              className="gallery-drag-handle media-stack-handle"
              {...attributes}
              {...listeners}
              aria-label="Drag to reposition"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical size={16} />
            </button>
            <MediaEditToolbar
              uploading={uploading && targetIndex === index}
              onReplace={() => onPick(index)}
              onBringFront={() => onLayer(index, "front")}
              onSendBack={() => onLayer(index, "back")}
              onRemove={() => onRemove(index)}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function EditableMediaStack({ pageSlug }: EditableMediaStackProps) {
  const { site, editMode, isAdmin, updateBlockValue } = useEditor();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const editable = editMode && isAdmin;

  const fallback = { items: [] as MediaItem[] };
  const stored = site
    ? getJson<{ items: MediaItem[] }>(site, pageSlug, "media", "media-stack", fallback)
    : fallback;

  const items = sortByLayer((stored.items ?? []).map(normalizeMediaItem));

  const saveItems = useCallback(
    (next: MediaItem[]) => {
      updateBlockValue(pageSlug, "media", "media-stack", { items: next });
    },
    [pageSlug, updateBlockValue]
  );

  const handleFile = async (file: File, index: number) => {
    if (!site || !file) return;
    setUploading(true);
    try {
      const asset = await uploadMedia(file, site.clientId);
      const next = [...items];
      next[index] = {
        src: asset.publicUrl,
        alt: file.name,
        type: mediaKindFromFile(file),
        zIndex: next[index]?.zIndex ?? index + 1,
      };
      saveItems(next);
    } finally {
      setUploading(false);
      setTargetIndex(null);
    }
  };

  const addItem = () => {
    saveItems([
      ...items,
      { src: "", alt: "", type: "image", zIndex: items.length + 1 },
    ]);
  };

  const removeItem = (index: number) => {
    saveItems(items.filter((_, i) => i !== index));
  };

  const layerItem = (index: number, dir: "front" | "back") => {
    const next = dir === "front" ? bringForward(items, index) : sendBackward(items, index);
    saveItems(next);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((_, i) => `stack-${i}` === active.id);
    const newIndex = items.findIndex((_, i) => `stack-${i}` === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = [...items];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    saveItems(next.map((item, i) => ({ ...item, zIndex: i + 1 })));
  };

  if (!editable && !items.some((i) => i.src)) return null;

  const sortIds = items.map((_, i) => `stack-${i}`);

  const cells = items.map((item, i) => (
    <StackCell
      key={`stack-${i}-${item.src}`}
      item={item}
      index={i}
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
    <section className="media-stack-section">
      {editable && (
        <p className="media-stack-hint">
          Drag to reposition · Front / Back controls layer order · Tap to upload photos or videos
        </p>
      )}
      <div className="media-stack-canvas">
        {editable ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={sortIds} strategy={rectSortingStrategy}>
              {cells}
            </SortableContext>
          </DndContext>
        ) : (
          cells
        )}
        {editable && (
          <button type="button" className="media-stack-add" onClick={addItem}>
            <Plus size={18} />
            Add media
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f && targetIndex !== null) handleFile(f, targetIndex);
          e.target.value = "";
        }}
      />
    </section>
  );
}
