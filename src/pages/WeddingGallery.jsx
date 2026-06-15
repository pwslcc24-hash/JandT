import { Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getPhotoAlbum } from "@/config/wedding";
import PageChrome from "@/components/wedding/PageChrome";
import EditableText from "@/components/editor/EditableText";
import EditableGallery from "@/components/editor/EditableGallery";
import { usePhotoAlbum } from "@/cms/hooks/useSiteContent";

export default function WeddingGallery() {
  const { album: albumSlug } = useParams();
  const cmsAlbum = usePhotoAlbum(albumSlug ?? "");
  const fallbackAlbum = getPhotoAlbum(albumSlug);
  const album = cmsAlbum ?? fallbackAlbum;

  if (!album) return <Navigate to="/photos" replace />;

  return (
    <PageChrome backTo="/photos">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1 className="section-title">{album.label}</h1>
        <EditableGallery albumSlug={album.slug} album={album} />
      </motion.div>
    </PageChrome>
  );
}
