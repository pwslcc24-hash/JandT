import { ArrowDown, ArrowUp, Trash2, Upload } from "lucide-react";

interface MediaEditToolbarProps {
  onReplace: () => void;
  onBringFront: () => void;
  onSendBack: () => void;
  onRemove?: () => void;
  uploading?: boolean;
}

export default function MediaEditToolbar({
  onReplace,
  onBringFront,
  onSendBack,
  onRemove,
  uploading,
}: MediaEditToolbarProps) {
  return (
    <div className="media-edit-toolbar" onClick={(e) => e.stopPropagation()}>
      <button type="button" title="Replace photo or video" onClick={onReplace} disabled={uploading}>
        <Upload size={14} />
        {uploading ? "…" : "Replace"}
      </button>
      <button type="button" title="Bring to front" onClick={onBringFront}>
        <ArrowUp size={14} />
        Front
      </button>
      <button type="button" title="Send to back" onClick={onSendBack}>
        <ArrowDown size={14} />
        Back
      </button>
      {onRemove && (
        <button type="button" className="media-edit-toolbar--danger" title="Remove" onClick={onRemove}>
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
