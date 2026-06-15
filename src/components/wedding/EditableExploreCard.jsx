import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEditor } from "@/cms/context/EditorContext";
import { uploadMedia } from "@/cms/api/content";
import { mediaKindFromFile } from "@/cms/mediaTypes";
import { cn } from "@/lib/utils";
import { Film, ImagePlus } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { WeddingIcon } from "./icons";
import MediaRenderer from "@/components/editor/MediaRenderer";

export default function EditableExploreCard({ item, index }) {
  const { editMode, isAdmin, site, updateBlockValue } = useEditor();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const editable = editMode && isAdmin;
  const hasMedia = Boolean(item.mediaUrl);

  const updateCardMedia = useCallback(
    (patch) => {
      if (!site) return;
      const block = site.pages
        .find((p) => p.slug === "home")
        ?.sections.find((s) => s.sectionKey === "explore")
        ?.blocks.find((b) => b.blockKey === "explore-cards");
      const items = block?.value?.items ?? [];
      const next = items.map((card, i) => (i === index ? { ...card, ...patch } : card));
      updateBlockValue("home", "explore", "explore-cards", { items: next });
    },
    [site, index, updateBlockValue]
  );

  const handleFile = async (file) => {
    if (!site || !file) return;
    setUploading(true);
    try {
      const asset = await uploadMedia(file, site.clientId);
      updateCardMedia({
        mediaUrl: asset.publicUrl,
        mediaType: mediaKindFromFile(file),
      });
    } finally {
      setUploading(false);
    }
  };

  const openPicker = (e) => {
    if (!editable) return;
    e.preventDefault();
    e.stopPropagation();
    inputRef.current?.click();
  };

  const cardInner = (
    <>
      {hasMedia && (
        <div className="card-media">
          <MediaRenderer
            src={item.mediaUrl}
            type={item.mediaType ?? "image"}
            alt={item.label}
            className="card-media-el"
          />
        </div>
      )}
      {!hasMedia && (
        <div className="card-icon">
          <WeddingIcon name={item.icon} className="card-icon-svg" />
        </div>
      )}
      <div className="card-overlay" />
      <div className="card-bottom">
        <div className="card-link">
          <span className="card-link-label">{item.label}</span>
          <span className="card-link-underline" aria-hidden="true">
            <span className="card-link-line" />
          </span>
        </div>
        <span className="card-link-arrow" aria-hidden="true">
          <WeddingIcon name="forward" className="card-arrow-icon" />
        </span>
      </div>
      {editable && (
        <button
          type="button"
          className="card-media-upload"
          onClick={openPicker}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleFile(e.dataTransfer.files[0]);
          }}
        >
          {uploading ? (
            <span>Uploading…</span>
          ) : (
            <>
              {hasMedia ? <ImagePlus size={18} /> : <Film size={18} />}
              <span>{hasMedia ? "Replace media" : "Add photo / video"}</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="sr-only"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </>
  );

  return (
    <motion.div
      className="card-wrap"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        delay: index * 0.09,
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {editable ? (
        <div className={cn("card", "card--editable", hasMedia && "card--has-media")}>{cardInner}</div>
      ) : (
        <Link to={`/${item.slug}`} className={cn("card", hasMedia && "card--has-media")}>
          {cardInner}
        </Link>
      )}
    </motion.div>
  );
}
