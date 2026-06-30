import { memo, useRef, useState, useCallback, useEffect } from "react";
import type { VideoMedia } from "../../types/news.types";

interface MediaPlayerProps {
  videos: VideoMedia[];
}

const SingleVideoPlayer = memo(function SingleVideoPlayer({
  video,
}: {
  video: VideoMedia;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting && videoRef.current && isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.5 }
    );

    observerRef.current.observe(container);
    return () => observerRef.current?.disconnect();
  }, [isPlaying]);

  useEffect(() => {
    if (!video.stream_url || !videoRef.current) return;

    let hls: { destroy(): void } | null = null;
    import("hls.js").then(({ default: Hls }) => {
      if (Hls.isSupported() && videoRef.current && video.stream_url) {
        const h = new Hls();
        h.loadSource(video.stream_url);
        h.attachMedia(videoRef.current);
        hls = h;
      }
    });

    return () => {
      hls?.destroy();
    };
  }, [video.stream_url]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!videoRef.current) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pct * video.duration_seconds;
    },
    [video.duration_seconds]
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseFloat(e.target.value);
      setVolume(v);
      if (videoRef.current) videoRef.current.volume = v;
    },
    []
  );

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <div ref={containerRef} className="relative" style={{ aspectRatio: "16/9" }}>
        {!isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer bg-black/40"
            onClick={togglePlay}
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <span className="text-white text-xl ml-1">&#9654;</span>
            </div>
          </div>
        )}
        {!isPlaying && video.thumbnail_url && (
          <img
            src={video.thumbnail_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <video
          ref={videoRef}
          src={video.stream_url ? undefined : video.url}
          className="w-full h-full object-cover bg-black"
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-2 py-1.5 flex items-center gap-2 z-20">
          <button
            onClick={togglePlay}
            className="text-white text-xs hover:text-[#0088FF]"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <div
            className="flex-1 h-1 bg-[#0A1628] cursor-pointer relative"
            style={{ borderRadius: "1px" }}
            onClick={handleSeek}
          >
            <div
              className="h-full bg-[#0088FF]"
              style={{
                width: `${(currentTime / Math.max(video.duration_seconds, 1)) * 100}%`,
                borderRadius: "1px",
              }}
            />
          </div>
          <span className="text-[10px] text-[#7799BB] whitespace-nowrap" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            {formatTime(currentTime)} / {formatTime(video.duration_seconds)}
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-12 h-1 appearance-none bg-[#0A1628]"
          />
          <button
            onClick={() => setShowFullscreen(true)}
            className="text-white text-xs hover:text-[#0088FF]"
          >
            &#x26F6;
          </button>
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white text-xs hover:text-[#0088FF]"
          >
            &#x2197;
          </a>
        </div>
      </div>

      {showFullscreen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95"
          style={{ pointerEvents: "auto" }}
        >
          <div className="relative w-full max-w-[90vw] max-h-[90vh]">
            <video
              src={video.url}
              className="w-full max-h-[85vh] object-contain"
              controls
              autoPlay
            />
            {video.caption_en && (
              <div className="text-center text-sm text-[#E0EEFF] mt-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                {video.caption_en}
              </div>
            )}
            <button
              onClick={() => setShowFullscreen(false)}
              className="absolute top-2 right-2 text-white/50 hover:text-white text-xl bg-black/50 px-2 py-1 border border-[#0D2137]"
              style={{ borderRadius: "2px" }}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
});

export const MediaPlayer = memo(function MediaPlayer({ videos }: MediaPlayerProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (videos.length === 0) return null;

  return (
    <div className="space-y-2">
      <SingleVideoPlayer video={videos[activeIndex]} />
      {videos.length > 1 && (
        <div className="flex gap-1 overflow-x-auto">
          {videos.map((v, i) => (
            <button
              key={v.id}
              onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 w-16 h-10 overflow-hidden border transition-all ${
                i === activeIndex
                  ? "border-[#0088FF]"
                  : "border-[#0D2137] hover:border-[#1A4A7A]"
              }`}
              style={{ borderRadius: "2px" }}
            >
              <img
                src={v.thumbnail_url}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
