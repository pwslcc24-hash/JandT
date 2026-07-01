import { Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { slideDown, fadeUp } from "@/lib/motionVariants";
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
      <motion.h1 className="section-title" variants={slideDown}>{album.label}</motion.h1>
      <motion.div variants={fadeUp}>
        <EditableGallery albumSlug={album.slug} album={album} />
      </motion.div>
    </PageChrome>
  );
}