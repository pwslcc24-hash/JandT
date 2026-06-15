import type { MediaKind } from "@/cms/mediaTypes";
import { cn } from "@/lib/utils";

interface MediaRendererProps {
  src: string;
  type?: MediaKind;
  alt?: string;
  className?: string;
  autoPlay?: boolean;
}

export default function MediaRenderer({
  src,
  type = "image",
  alt = "",
  className,
  autoPlay = true,
}: MediaRendererProps) {
  if (!src) return null;

  if (type === "video") {
    return (
      <video
        src={src}
        className={cn("cms-media-video", className)}
        autoPlay={autoPlay}
        loop
        muted
        playsInline
        aria-label={alt || "Video"}
      />
    );
  }

  return (
    <img src={src} alt={alt} className={cn("cms-media-image", className)} loading="lazy" />
  );
}
