"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { MediaImage } from "@/lib/project-page.types";
import "@/styles/modals.css";

type ProjectPhotoGalleryModalProps = {
  images: MediaImage[];
  initialIndex: number;
  onClose: () => void;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.5;
const SWIPE_THRESHOLD = 80;
const SLIDE_DRAG_CLAMP = 320;

export default function ProjectPhotoGalleryModal({
  images,
  initialIndex,
  onClose,
}: ProjectPhotoGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSlideDragging, setIsSlideDragging] = useState(false);
  const [slideDragOffset, setSlideDragOffset] = useState(0);
  const dragStart = useRef<{
    x: number;
    y: number;
    posX: number;
    posY: number;
    mode: "pan" | "slide";
  }>({ x: 0, y: 0, posX: 0, posY: 0, mode: "pan" });
  const slideDragOffsetRef = useRef(0);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);

  const image = images[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const goPrev = useCallback(() => {
    if (!hasPrev) return;
    setSlideDirection("right");
    setCurrentIndex((i) => i - 1);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [hasPrev]);

  const goNext = useCallback(() => {
    if (!hasNext) return;
    setSlideDirection("left");
    setCurrentIndex((i) => i + 1);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [hasNext]);

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(MAX_ZOOM, s + ZOOM_STEP));
    setPosition({ x: 0, y: 0 });
  }, []);

  const zoomOut = useCallback(() => {
    setScale((s) => {
      const next = Math.max(MIN_ZOOM, s - ZOOM_STEP);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) zoomIn();
      else zoomOut();
    },
    [zoomIn, zoomOut]
  );

  const handlePointerDown = useCallback(
    (clientX: number, clientY: number) => {
      if (scale > 1) {
        dragStart.current = {
          x: clientX,
          y: clientY,
          posX: position.x,
          posY: position.y,
          mode: "pan",
        };
        setIsDragging(true);
      } else {
        dragStart.current = {
          x: clientX,
          y: clientY,
          posX: 0,
          posY: 0,
          mode: "slide",
        };
        setIsSlideDragging(true);
        setSlideDragOffset(0);
      }
    },
    [scale, position]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handlePointerDown(e.clientX, e.clientY);
    },
    [handlePointerDown]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length !== 1) return;
      handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
    },
    [handlePointerDown]
  );

  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      const { mode } = dragStart.current;
      if (mode === "pan" && isDragging) {
        const dx = clientX - dragStart.current.x;
        const dy = clientY - dragStart.current.y;
        setPosition({
          x: dragStart.current.posX + dx,
          y: dragStart.current.posY + dy,
        });
      } else if (mode === "slide" && isSlideDragging) {
        const dx = clientX - dragStart.current.x;
        const clamped = Math.max(
          -SLIDE_DRAG_CLAMP,
          Math.min(SLIDE_DRAG_CLAMP, dx)
        );
        slideDragOffsetRef.current = clamped;
        setSlideDragOffset(clamped);
      }
    },
    [isDragging, isSlideDragging]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY),
    [handlePointerMove]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    },
    [handlePointerMove]
  );

  const handlePointerUp = useCallback(() => {
    if (dragStart.current.mode === "pan") {
      setIsDragging(false);
      return;
    }
    if (dragStart.current.mode === "slide") {
      const offset = slideDragOffsetRef.current;
      if (offset > SWIPE_THRESHOLD && hasPrev) {
        goPrev();
        setSlideDragOffset(0);
      } else if (offset < -SWIPE_THRESHOLD && hasNext) {
        goNext();
        setSlideDragOffset(0);
      } else {
        setSlideDragOffset(0);
      }
      setIsSlideDragging(false);
    }
  }, [hasNext, hasPrev, goNext, goPrev]);

  const handleMouseUp = useCallback(() => handlePointerUp(), [handlePointerUp]);
  const handleTouchEnd = useCallback(() => handlePointerUp(), [handlePointerUp]);

  useEffect(() => {
    if (slideDirection === null) return;
    const t = setTimeout(() => setSlideDirection(null), 400);
    return () => clearTimeout(t);
  }, [currentIndex, slideDirection]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, goPrev, goNext]);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (isSlideDragging && e.cancelable) e.preventDefault();
      handleTouchMove(e);
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) handleTouchEnd();
    };
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);
    document.addEventListener("touchcancel", onTouchEnd);
    return () => {
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [isSlideDragging, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!image || images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Галерея фотографий"
    >
      <div
        className="absolute inset-0 animate-modal-backdrop backdrop-blur-sm"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        onClick={onClose}
        aria-hidden
      />

      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#DBDBDB]"
        aria-label="Закрыть"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-white/10 rounded-full px-3 py-2">
        <button
          type="button"
          onClick={zoomOut}
          disabled={scale <= MIN_ZOOM}
          className="w-10 h-10 flex items-center justify-center rounded-full text-white hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Уменьшить"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <span className="text-white text-sm font-medium min-w-12 text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          type="button"
          onClick={zoomIn}
          disabled={scale >= MAX_ZOOM}
          className="w-10 h-10 flex items-center justify-center rounded-full text-white hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Увеличить"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" strokeWidth={2} />
          </svg>
        </button>
      </div>

      {hasPrev && (
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-14 h-14 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#DBDBDB]"
          aria-label="Предыдущее фото"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {hasNext && (
        <button
          type="button"
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-14 h-14 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#DBDBDB]"
          aria-label="Следующее фото"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden touch-none pointer-events-none min-w-0 min-h-0"
        style={{
          cursor:
            scale > 1
              ? isDragging
                ? "grabbing"
                : "grab"
              : isSlideDragging
                ? "grabbing"
                : "grab",
        }}
      >
        <div
          className="flex items-center justify-center w-full h-full min-w-0 min-h-0 overflow-hidden select-none pointer-events-auto touch-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onWheel={handleWheel}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("img")) return;
            onClose();
          }}
          style={{
            transform: `translate(${position.x + slideDragOffset}px, ${position.y}px) scale(${scale})`,
            transition:
              isDragging || isSlideDragging
                ? "none"
                : "transform 0.4s cubic-bezier(0.33, 1, 0.68, 1)",
          }}
        >
          <div
            key={currentIndex}
            className={`relative flex items-center justify-center w-full h-full min-w-0 min-h-0 ${slideDirection === "left" ? "animate-modal-slide-left" : slideDirection === "right" ? "animate-modal-slide-right" : ""}`}
          >
            <img
              src={image.url}
              alt={image.alt ?? ""}
              className="max-w-full max-h-full w-auto h-auto object-contain block"
              draggable={false}
              style={{ maxHeight: "100vh" }}
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-center px-4 animate-modal-content">
        <p className="text-white/60 text-sm">
          {currentIndex + 1} / {images.length}
        </p>
      </div>
    </div>
  );
}
