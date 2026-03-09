"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, X } from "lucide-react";
import { Lightbox } from "./Lightbox";
import { VideoPlayer } from "./VideoPlayer";

type MediaImage = { id: string; url: string };
type MediaVideo = { id: string; url: string };

export function EventMediaGallery({
  images,
  videos,
  borderRadius,
}: {
  images: MediaImage[];
  videos: MediaVideo[];
  borderRadius: number;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  if (images.length === 0 && videos.length === 0) return null;

  return (
    <>
      <div className="mt-10 grid grid-cols-2 gap-3">
        {images.map((img, i) => (
          <div
            key={img.id}
            className="relative aspect-[4/3] overflow-hidden gallery-item cursor-pointer group"
            style={{ borderRadius }}
            onClick={() => setLightboxIndex(i)}
          >
            <Image
              src={img.url}
              alt=""
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 400px"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
        ))}

        {videos.map((vid) => (
          <div
            key={vid.id}
            className="relative aspect-[4/3] overflow-hidden gallery-item cursor-pointer group"
            style={{ borderRadius }}
            onClick={() => setActiveVideoUrl(vid.url)}
          >
            <video
              src={`${vid.url}#t=0.1`}
              preload="metadata"
              className="w-full h-full object-cover"
              muted
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/25 transition-transform group-hover:scale-110">
                <Play size={24} className="text-white ml-0.5" fill="white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images.map((img) => ({ url: img.url }))}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {activeVideoUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={() => setActiveVideoUrl(null)}
        >
          <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" />
          <button
            onClick={() => setActiveVideoUrl(null)}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all border-none cursor-pointer backdrop-blur-sm"
          >
            <X size={20} />
          </button>
          <div
            className="relative z-10 w-full max-w-4xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <VideoPlayer
              key={activeVideoUrl}
              src={activeVideoUrl}
              className="w-full aspect-video rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
}
