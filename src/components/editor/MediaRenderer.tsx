import type { MediaKind } from "@/cms/mediaTypes";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef } from "react";

interface MediaRendererProps {
  src: string;
  type?: MediaKind;
  alt?: string;
  className?: string;
  autoPlay?: boolean;
}

function prepareMobileVideo(video: HTMLVideoElement) {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
}

export default function MediaRenderer({
  src,
  type = "image",
  alt = "",
  className,
  autoPlay = true,
}: MediaRendererProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const tryPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || !autoPlay) return;

    prepareMobileVideo(video);
    const attempt = video.play();
    if (!attempt) return;

    attempt.catch(() => {
      const unlock = () => {
        prepareMobileVideo(video);
        void video.play().catch(() => {});
      };
      document.addEventListener("touchstart", unlock, { capture: true, passive: true, once: true });
      document.addEventListener("click", unlock, { capture: true, passive: true, once: true });
    });
  }, [autoPlay]);

  useEffect(() => {
    if (type !== "video" || !autoPlay) return;

    const video = videoRef.current;
    if (!video) return;

    prepareMobileVideo(video);
    tryPlay();

    const onReady = () => tryPlay();
    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);

    const onVisible = () => {
      if (document.visibilityState === "visible") tryPlay();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [type, autoPlay, src, tryPlay]);

  if (!src) return null;

  if (type === "video") {
    return (
      <video
        ref={videoRef}
        src={src}
        className={cn("cms-media-video", className)}
        autoPlay={autoPlay}
        loop
        muted
        defaultMuted
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        aria-label={alt || "Video"}
      />
    );
  }

  return (
    <img src={src} alt={alt} className={cn("cms-media-image", className)} loading="lazy" />
  );
}
