import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { WeddingIcon } from "./icons";
import { useEditor } from "@/cms/context/EditorContext";
import { cn } from "@/lib/utils";
import { useCallback, useRef } from "react";

// Waterfall: each item drops down and drifts right
const itemMotion = {
  hidden: { opacity: 0, y: -22, x: -14 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    x: 0,
    transition: {
      delay: 0.08 * i,
      type: "spring",
      damping: 26,
      stiffness: 280,
    },
  }),
};

export default function PhotoAlbumList({
  albums,
  pageSlug = "photos",
  sectionKey = "photo-albums",
  blockKey = "photo-albums",
}) {
  const { editMode, isAdmin, updateBlockValue } = useEditor();
  const editable = editMode && isAdmin;

  const updateLabel = useCallback(
    (index, label) => {
      const next = albums.map((a, i) => (i === index ? { ...a, label } : a));
      updateBlockValue(pageSlug, sectionKey, blockKey, { items: next });
    },
    [albums, updateBlockValue, pageSlug, sectionKey, blockKey]
  );

  return (
    <nav className="photo-album-list">
      {albums.map((album, i) => (
        <motion.div
          key={album.slug}
          variants={itemMotion}
          initial="hidden"
          animate="visible"
          custom={i}
        >
          {editable ? (
            <EditableAlbumRow album={album} index={i} onLabelChange={updateLabel} />
          ) : (
            <Link to={`/photos/${album.slug}`} className="photo-album-item">
              <span className="photo-album-label">{album.label}</span>
              <span className="photo-album-underline" aria-hidden="true">
                <span className="photo-album-line" />
              </span>
              <span className="photo-album-arrow" aria-hidden="true">
                <WeddingIcon name="forward" className="photo-album-arrow-icon" />
              </span>
            </Link>
          )}
        </motion.div>
      ))}
    </nav>
  );
}

function EditableAlbumRow({ album, index, onLabelChange }) {
  const ref = useRef(null);

  return (
    <div className={cn("photo-album-item", "photo-album-item--editable", "cms-editable")}>
      <span
        ref={ref}
        className="photo-album-label"
        contentEditable
        suppressContentEditableWarning
        onBlur={() => {
          const label = ref.current?.textContent?.trim() ?? album.label;
          if (label !== album.label) onLabelChange(index, label);
        }}
      >
        {album.label}
      </span>
      <span className="photo-album-underline" aria-hidden="true">
        <span className="photo-album-line photo-album-line--visible" />
      </span>
      <Link to={`/photos/${album.slug}`} className="photo-album-arrow photo-album-arrow--visible">
        <WeddingIcon name="forward" className="photo-album-arrow-icon" />
      </Link>
    </div>
  );
}