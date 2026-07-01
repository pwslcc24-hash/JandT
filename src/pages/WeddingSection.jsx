import { Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { slideDown, fadeUp } from "@/lib/motionVariants";
import { getNavBySlug } from "@/config/wedding";
import PageChrome from "@/components/wedding/PageChrome";
import PhotoAlbumList from "@/components/wedding/PhotoAlbumList";
import { DEFAULT_AGENDA_HTML } from "@/cms/seed/agendaHtml";
import EditableText from "@/components/editor/EditableText";
import EditableRichText from "@/components/editor/EditableRichText";
import EditableMediaStack from "@/components/editor/EditableMediaStack";
import { usePhotoAlbums, usePageContent } from "@/cms/hooks/useSiteContent";

export default function WeddingSection() {
  const { slug } = useParams();
  const section = getNavBySlug(slug);
  const photoAlbums = usePhotoAlbums();
  const pageContent = usePageContent(slug ?? "");

  if (!section) return <Navigate to="/" replace />;

  const isPhotos = slug === "photos";

  return (
    <PageChrome>
      {isPhotos ? (
        <>
          <EditableText
            pageSlug="photos"
            sectionKey="photo-albums"
            blockKey="photos-title"
            fallback={section.title}
            className="section-title section-title--photos"
            as={motion.h1}
            variants={slideDown}
          />
          <motion.div variants={fadeUp}>
            <PhotoAlbumList albums={photoAlbums} />
          </motion.div>
        </>
      ) : (
        <>
          <EditableText
            pageSlug={slug}
            sectionKey="content"
            blockKey="title"
            fallback={pageContent.title || section.title}
            className="section-title"
            as={motion.h1}
            variants={slideDown}
          />
          <motion.div variants={fadeUp}>
            <EditableRichText
              pageSlug={slug}
              sectionKey="content"
              blockKey="body"
              fallback={slug === "info" ? DEFAULT_AGENDA_HTML : pageContent.bodyHtml}
              className={
                slug === "info"
                  ? "section-body-rich agenda-rich"
                  : slug === "registry"
                    ? "section-body-rich registry-rich"
                    : "section-body-rich"
              }
            />
            <EditableMediaStack pageSlug={slug} />
          </motion.div>
        </>
      )}
    </PageChrome>
  );
}