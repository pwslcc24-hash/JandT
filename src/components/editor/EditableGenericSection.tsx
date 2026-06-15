import { useEditor } from "@/cms/context/EditorContext";
import { useEditorTarget } from "@/cms/hooks/useEditorTarget";
import EditableText from "./EditableText";
import EditableRichText from "./EditableRichText";
import EditableMedia from "./EditableMedia";
import { sortedCopy } from "@/cms/utils/immutable";

interface EditableGenericSectionProps {
  pageSlug: string;
  sectionKey: string;
  section?: SiteSection | null;
  variant?: "landing" | "page";
}

function renderBlock(pageSlug: string, sectionKey: string, block: ContentBlock) {
  const key = block.blockKey;

  if (block.blockType === "rich_text") {
    return (
      <EditableRichText
        key={key}
        pageSlug={pageSlug}
        sectionKey={sectionKey}
        blockKey={key}
        fallback={String(block.value?.html ?? "<p></p>")}
        className="generic-rich-text"
      />
    );
  }

  if (block.blockType === "image") {
    return (
      <EditableMedia
        key={key}
        pageSlug={pageSlug}
        sectionKey={sectionKey}
        blockKey={key}
        fallbackUrl={String(block.value?.url ?? "")}
        fallbackType={(block.value?.mediaType as "image" | "video") ?? "image"}
        variant="inline"
        className="generic-media"
        mediaClassName="generic-media-el"
      />
    );
  }

  if (block.blockType === "json") {
    return null;
  }

  const textClass =
    key === "title" || key === "quote"
      ? "generic-block-title"
      : key === "eyebrow"
        ? "generic-block-eyebrow"
        : key === "attribution"
          ? "generic-block-attribution"
          : "generic-block-text";

  return (
    <EditableText
      key={key}
      pageSlug={pageSlug}
      sectionKey={sectionKey}
      blockKey={key}
      fallback={String(block.value?.text ?? "")}
      className={textClass}
      as={key === "title" || key === "quote" ? "h2" : "p"}
    />
  );
}

export default function EditableGenericSection({
  pageSlug,
  sectionKey,
  section,
  variant = "landing",
}: EditableGenericSectionProps) {
  const { site } = useEditor();

  const resolved =
    section ??
    site?.pages
      .find((p) => p.slug === pageSlug)
      ?.sections.find((s) => s.sectionKey === sectionKey);

  const { targetClass, handleTargetPointer } = useEditorTarget({
    pageSlug,
    sectionKey,
    sectionId: resolved?.id,
    targetType: "section",
    label: `${pageSlug} / ${sectionKey} section`,
  });

  if (!resolved) return null;

  const sectionStyle = resolved.styles as React.CSSProperties;
  const typeClass = `generic-section--${resolved.sectionType.replace("custom-", "")}`;

  return (
    <section
      className={`generic-section ${typeClass} generic-section--${variant} ${targetClass}`.trim()}
      style={sectionStyle}
      data-section-key={sectionKey}
      onClick={(e) => handleTargetPointer(e)}
    >
      <div className="generic-section-inner">
        {sortedCopy(resolved.blocks, (a, b) => a.sortOrder - b.sortOrder).map((block) =>
          renderBlock(pageSlug, sectionKey, block)
        )}
      </div>
    </section>
  );
}
