"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export function Lightbox({
  images,
  initialIndex = 0,
  onClose,
}: {
  images: { url: string; alt?: string }[];
  initialIndex?: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(initialIndex);

  const goNext = useCallback(() => {
    setCurrent((c) => (c + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrent((c) => (c - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowRight":
          goNext();
          break;
        case "ArrowLeft":
          goPrev();
          break;
      }
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, goNext, goPrev]);

  if (images.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" />

      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all border-none cursor-pointer backdrop-blur-sm"
      >
        <X size={20} />
      </button>

      {images.length > 1 && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 text-[12px] text-white/50 font-mono">
          {current + 1} / {images.length}
        </div>
      )}

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-4 z-20 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all border-none cursor-pointer backdrop-blur-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-4 z-20 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all border-none cursor-pointer backdrop-blur-sm"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      <div
        className="relative w-[90vw] h-[85vh] z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[current].url}
          alt={images[current].alt ?? ""}
          fill
          className="object-contain"
          sizes="90vw"
          priority
        />
      </div>
    </div>
  );
}
