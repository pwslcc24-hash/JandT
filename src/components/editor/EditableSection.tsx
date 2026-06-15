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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEditor } from "@/cms/context/EditorContext";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

interface EditableSectionProps {
  pageSlug: string;
  sectionId: string;
  sectionKey: string;
  children: React.ReactNode;
  className?: string;
}

function SortableSection({
  pageSlug,
  sectionId,
  sectionKey,
  children,
  className,
}: EditableSectionProps) {
  const { editMode, isAdmin } = useEditor();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: sectionId, disabled: !editMode || !isAdmin });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        className,
        editMode && isAdmin && "cms-editable-section",
        isDragging && "cms-dragging"
      )}
      data-section-key={sectionKey}
    >
      {editMode && isAdmin && (
        <button
          type="button"
          className="cms-section-handle"
          {...attributes}
          {...listeners}
          aria-label="Drag section"
        >
          <GripVertical size={18} />
        </button>
      )}
      {children}
    </div>
  );
}

interface SectionListProps {
  pageSlug: string;
  sectionIds: string[];
  renderSection: (sectionId: string, sectionKey: string) => React.ReactNode;
  getSectionKey: (sectionId: string) => string;
}

export function EditableSectionList({
  pageSlug,
  sectionIds,
  renderSection,
  getSectionKey,
}: SectionListProps) {
  const { editMode, isAdmin, reorderSections } = useEditor();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sectionIds.indexOf(String(active.id));
    const newIndex = sectionIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const next = [...sectionIds];
    const [removed] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, removed);
    reorderSections(pageSlug, next);
  };

  if (!editMode || !isAdmin) {
    return (
      <>
        {sectionIds.map((id) => (
          <div key={id}>{renderSection(id, getSectionKey(id))}</div>
        ))}
      </>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
        {sectionIds.map((id) => (
          <SortableSection
            key={id}
            pageSlug={pageSlug}
            sectionId={id}
            sectionKey={getSectionKey(id)}
            className=""
          >
            {renderSection(id, getSectionKey(id))}
          </SortableSection>
        ))}
      </SortableContext>
    </DndContext>
  );
}

export default SortableSection;
