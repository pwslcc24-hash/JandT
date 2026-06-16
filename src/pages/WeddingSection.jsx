import { Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {isPhotos ? (
          <>
            <EditableText
              pageSlug="photos"
              sectionKey="photo-albums"
              blockKey="photos-title"
              fallback={section.title}
              className="section-title section-title--photos"
              as="h1"
            />
            <PhotoAlbumList albums={photoAlbums} />
          </>
        ) : (
          <>
            <EditableText
              pageSlug={slug}
              sectionKey="content"
              blockKey="title"
              fallback={pageContent.title || section.title}
              className="section-title"
              as="h1"
            />
            <EditableRichText
              pageSlug={slug}
              sectionKey="content"
              blockKey="body"
              fallback={slug === "info" ? DEFAULT_AGENDA_HTML : pageContent.bodyHtml}
              className={slug === "info" ? "section-body-rich agenda-rich" : "section-body-rich"}
            />
            <EditableMediaStack pageSlug={slug} />
          </>
        )}
      </motion.div>
    </PageChrome>
  );
}
