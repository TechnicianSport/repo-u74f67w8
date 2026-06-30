import { memo, useState, useCallback, useEffect, useRef } from "react";
import type { ImageMedia } from "../../types/news.types";

interface MediaGalleryProps {
  images: ImageMedia[];
}

export const MediaGallery = memo(function MediaGallery({ images }: MediaGalleryProps) {
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const openFullscreen = useCallback((index: number) => {
    setFullscreenIndex(index);
  }, []);

  const closeFullscreen = useCallback(() => {
    setFullscreenIndex(null);
  }, []);

  const navigateFullscreen = useCallback(
    (dir: -1 | 1) => {
      if (fullscreenIndex === null) return;
      const next = fullscreenIndex + dir;
      if (next >= 0 && next < images.length) {
        setFullscreenIndex(next);
      }
    },
    [fullscreenIndex, images.length]
  );

  useEffect(() => {
    if (fullscreenIndex === null) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") navigateFullscreen(-1);
      if (e.key === "ArrowRight") navigateFullscreen(1);
      if (e.key === "Escape") closeFullscreen();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [fullscreenIndex, navigateFullscreen, closeFullscreen]);

  if (images.length === 0) return null;

  return (
    <>
      <div ref={containerRef} className="flex gap-2 overflow-x-auto py-2 scrollbar-thin">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => openFullscreen(i)}
            className="flex-shrink-0 group relative"
          >
            <img
              src={img.thumbnail_url}
              alt={img.caption_en ?? ""}
              className="h-20 w-auto object-cover border border-[#0D2137] group-hover:border-[#1A4A7A] transition-all group-hover:scale-105"
              style={{ borderRadius: "2px" }}
              loading="lazy"
            />
            {img.caption_en && (
              <div
                className="text-[9px] text-[#7799BB] mt-0.5 max-w-[100px] truncate"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {img.caption_en}
              </div>
            )}
          </button>
        ))}
      </div>

      {fullscreenIndex !== null && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.92)", pointerEvents: "auto" }}
          onClick={closeFullscreen}
        >
          <div
            className="relative max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[fullscreenIndex].url}
              alt={images[fullscreenIndex].caption_en ?? ""}
              className="max-w-full max-h-[80vh] object-contain"
            />
            <div className="mt-2 text-center">
              {images[fullscreenIndex].caption_en && (
                <div className="text-sm text-[#E0EEFF]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  {images[fullscreenIndex].caption_en}
                </div>
              )}
              {images[fullscreenIndex].credit && (
                <div className="text-[10px] text-[#334455]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  {images[fullscreenIndex].credit}
                </div>
              )}
            </div>

            <div className="absolute top-2 right-2 flex gap-2">
              <a
                href={images[fullscreenIndex].url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 text-xs text-[#7799BB] border border-[#0D2137] hover:text-white hover:border-[#1A4A7A] bg-black/50"
                style={{ borderRadius: "2px", fontFamily: "'IBM Plex Mono', monospace" }}
              >
                Download
              </a>
              <button
                onClick={closeFullscreen}
                className="px-2 py-1 text-xs text-[#7799BB] border border-[#0D2137] hover:text-white hover:border-[#1A4A7A] bg-black/50"
                style={{ borderRadius: "2px" }}
              >
                &times;
              </button>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 left-2">
              {fullscreenIndex > 0 && (
                <button
                  onClick={() => navigateFullscreen(-1)}
                  className="text-white/50 hover:text-white text-2xl px-2"
                >
                  &#8249;
                </button>
              )}
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-2">
              {fullscreenIndex < images.length - 1 && (
                <button
                  onClick={() => navigateFullscreen(1)}
                  className="text-white/50 hover:text-white text-2xl px-2"
                >
                  &#8250;
                </button>
              )}
            </div>

            <div className="text-center mt-1 text-[10px] text-[#334455]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {fullscreenIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
});
