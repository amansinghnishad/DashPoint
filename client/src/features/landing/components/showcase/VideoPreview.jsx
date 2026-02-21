import { m } from "framer-motion";
import { useEffect, useRef } from "react";

export default function VideoPreview({ src, isActive }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(() => {});
      return;
    }

    video.pause();
    video.currentTime = 0;
  }, [isActive]);

  return (
    <m.video
      ref={videoRef}
      src={src}
      loop
      muted
      playsInline
      preload="metadata"
      className="absolute inset-0 h-full w-full object-cover"
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: 0.6 }}
    />
  );
}
