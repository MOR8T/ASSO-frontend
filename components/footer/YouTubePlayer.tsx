"use client";

import Image from "next/image";
import { useState } from "react";

interface YouTubePlayerProps {
  /** YouTube video ID (from URL: youtube.com/watch?v=VIDEO_ID) */
  videoId: string;
  /** Custom thumbnail image (shown before play) */
  thumbnail: string | { src: string; width: number; height: number };
  /** Alt text for thumbnail */
  thumbnailAlt?: string;
  /** Label under the play button, e.g. "ПРОМО РОЛИК" */
  label?: string;
  /** Optional className for the wrapper */
  className?: string;
}

export default function YouTubePlayer({
  videoId,
  thumbnail,
  thumbnailAlt = "Превью видео",
  label = "ПРОМО РОЛИК",
  className = "",
}: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const thumbSrc = typeof thumbnail === "string" ? thumbnail : thumbnail.src;
  const thumbWidth = typeof thumbnail === "string" ? 1920 : thumbnail.width;
  const thumbHeight = typeof thumbnail === "string" ? 1080 : thumbnail.height;

  return (
    <div
      className={`relative w-full overflow-hidden bg-black aspect-video ${className}`}
      style={{ aspectRatio: "16/9" }}
    >
      {!isPlaying ? (
        <>
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            aria-label="Запустить видео"
          >
            <Image
              src={thumbSrc}
              alt={thumbnailAlt}
              width={thumbWidth}
              height={thumbHeight}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
            <span className="absolute bottom-40 left-30 z-10 flex flex-col items-start justify-center gap-4 rounded-full shadow-[0px_0px_100px_10px] shadow-black bg-black/40">
              <span
                className="w-30 h-30 border-2 border-[#DBDBDB] rounded-full bg-[rgba(49,53,59,0.8)] flex items-center justify-center shadow-lg hover:bg-[#3d4248] transition-colors shrink-0 mx-auto"
                aria-hidden
              >
                <span
                  className="w-0 h-0 border-y-22 border-y-transparent border-l-40 border-l-[#ff7d24] ml-1"
                  style={{
                    borderLeftColor: "#ff7d24",
                  }}
                />
              </span>
              <span className="text-[#DBDBDB] text-xl font-medium tracking-wider">
                {label}
              </span>
            </span>
          </button>
        </>
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title="YouTube видео"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      )}
    </div>
  );
}
