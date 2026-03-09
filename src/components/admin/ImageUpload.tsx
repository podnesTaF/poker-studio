"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, GripVertical, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import Image from "next/image";

export type ImageItem = {
  id?: string;
  url: string;
  gcsPath: string;
  order: number;
  isNew?: boolean;
};

export function ImageUpload({
  images,
  onChange,
  folder = "events",
}: {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  folder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sortedImages = [...images].sort((a, b) => a.order - b.order);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArr = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (fileArr.length === 0) return;

      setUploading(true);
      const newImages: ImageItem[] = [];

      for (const file of fileArr) {
        const res = await fetch("/api/storage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type || "application/octet-stream",
            folder,
          }),
        });
        if (!res.ok) continue;

        const { signedUrl, publicUrl, gcsPath } = await res.json();

        const put = await fetch(signedUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        if (!put.ok) continue;

        newImages.push({
          url: publicUrl,
          gcsPath,
          order: images.length + newImages.length,
          isNew: true,
        });
      }

      onChange([...images, ...newImages]);
      setUploading(false);
    },
    [images, onChange, folder]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  }

  function handleRemove(index: number) {
    const img = sortedImages[index];
    if (img.gcsPath) {
      fetch("/api/storage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gcsPath: img.gcsPath }),
      });
    }
    const updated = sortedImages.filter((_, i) => i !== index).map((img, i) => ({ ...img, order: i }));
    onChange(updated);
  }

  function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sortedImages.length) return;
    const updated = [...sortedImages];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    onChange(updated.map((img, i) => ({ ...img, order: i })));
  }

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-[#b5604a] bg-[rgba(181,96,74,0.06)]"
            : "border-[#e0d6c8] hover:border-[#c4b9a8] bg-[#fdfaf5]"
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={24} className="text-[#b5604a] animate-spin" />
            <p className="text-sm text-[#8c7f6e]">Uploading…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={24} className="text-[#8c7f6e]" />
            <p className="text-sm text-[#8c7f6e]">
              <span className="font-semibold text-[#b5604a]">Click to upload</span> or drag & drop
            </p>
            <p className="text-[11px] text-[#c4b9a8]">PNG, JPG, WebP up to 10MB</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Image grid */}
      {sortedImages.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {sortedImages.map((img, i) => (
            <div
              key={img.gcsPath}
              className="relative group rounded-lg overflow-hidden border border-[#e0d6c8] bg-[#fdfaf5]"
            >
              <div className="relative aspect-[4/3]">
                <Image src={img.url} alt="" fill className="object-cover" sizes="200px" />
                <div className="absolute inset-0 bg-[rgba(42,35,26,0)] group-hover:bg-[rgba(42,35,26,0.3)] transition-all" />
              </div>

              {/* Controls overlay */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(i);
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-md bg-white/90 backdrop-blur-sm text-[#b5604a] hover:bg-white transition-all shadow-sm"
                  title="Remove"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Order controls */}
              <div className="absolute top-2 left-2 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveImage(i, -1);
                  }}
                  disabled={i === 0}
                  className="w-6 h-6 flex items-center justify-center rounded bg-white/90 backdrop-blur-sm text-[#8c7f6e] hover:text-[#2a231a] transition-all shadow-sm disabled:opacity-30"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveImage(i, 1);
                  }}
                  disabled={i === sortedImages.length - 1}
                  className="w-6 h-6 flex items-center justify-center rounded bg-white/90 backdrop-blur-sm text-[#8c7f6e] hover:text-[#2a231a] transition-all shadow-sm disabled:opacity-30"
                >
                  <ChevronDown size={12} />
                </button>
              </div>

              {/* Badge */}
              <div className="absolute bottom-2 left-2 flex items-center gap-1">
                {i === 0 && (
                  <span className="text-[9px] font-bold tracking-[0.14em] uppercase px-1.5 py-0.5 rounded bg-[#b5604a] text-white">
                    Cover
                  </span>
                )}
                {img.isNew && (
                  <span className="text-[9px] font-bold tracking-[0.14em] uppercase px-1.5 py-0.5 rounded bg-[#4a7a6a] text-white">
                    New
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
