"use client";

import { useState, useCallback, useRef } from "react";
import { X, ChevronUp, ChevronDown, Loader2, Film, Star } from "lucide-react";

export type VideoItem = {
  id?: string;
  url: string;
  gcsPath: string;
  order: number;
  isCover: boolean;
  isNew?: boolean;
};

const MAX_VIDEO_SIZE = 70 * 1024 * 1024;

function uploadFileWithProgress(
  file: File,
  folder: string,
  onProgress: (percent: number) => void
): Promise<{ url: string; gcsPath: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error("Invalid server response"));
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          reject(new Error(data.error || `Upload failed (${xhr.status})`));
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Network error — please try again"));
    xhr.open("POST", "/api/storage");
    xhr.send(formData);
  });
}

export function VideoUpload({
  videos,
  onChange,
  folder = "events/videos",
}: {
  videos: VideoItem[];
  onChange: (videos: VideoItem[]) => void;
  folder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sortedVideos = [...videos].sort((a, b) => a.order - b.order);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArr = Array.from(files).filter((f) => f.type.startsWith("video/"));
      if (fileArr.length === 0) {
        setError("Please select video files (MP4, WebM, MOV)");
        return;
      }

      for (const file of fileArr) {
        if (file.size > MAX_VIDEO_SIZE) {
          setError(
            `"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)}MB — exceeds the 70MB limit`
          );
          return;
        }
      }

      setError(null);
      setUploading(true);
      setUploadProgress(0);
      const newVideos: VideoItem[] = [];
      const totalFiles = fileArr.length;

      for (let fi = 0; fi < totalFiles; fi++) {
        const file = fileArr[fi];
        try {
          const data = await uploadFileWithProgress(file, folder, (pct) => {
            setUploadProgress(Math.round(((fi + pct / 100) / totalFiles) * 100));
          });
          newVideos.push({
            url: data.url,
            gcsPath: data.gcsPath,
            order: videos.length + newVideos.length,
            isCover: false,
            isNew: true,
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : "Upload failed");
          setUploading(false);
          if (newVideos.length > 0) onChange([...videos, ...newVideos]);
          return;
        }
      }

      onChange([...videos, ...newVideos]);
      setUploading(false);
      setUploadProgress(0);
    },
    [videos, onChange, folder]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
  }

  function handleRemove(index: number) {
    const vid = sortedVideos[index];
    if (vid.gcsPath) {
      fetch("/api/storage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gcsPath: vid.gcsPath }),
      });
    }
    const updated = sortedVideos
      .filter((_, i) => i !== index)
      .map((v, i) => ({ ...v, order: i }));
    onChange(updated);
  }

  function toggleCover(index: number) {
    const updated = sortedVideos.map((v, i) => ({
      ...v,
      isCover: i === index ? !v.isCover : false,
    }));
    onChange(updated);
  }

  function moveVideo(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sortedVideos.length) return;
    const updated = [...sortedVideos];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    onChange(updated.map((v, i) => ({ ...v, order: i })));
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          uploading ? "cursor-default" : "cursor-pointer"
        } ${
          dragOver
            ? "border-[#b5604a] bg-[rgba(181,96,74,0.06)]"
            : "border-[#e0d6c8] hover:border-[#c4b9a8] bg-[#fdfaf5]"
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={24} className="text-[#b5604a] animate-spin" />
            <p className="text-sm text-[#8c7f6e]">Uploading video…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Film size={24} className="text-[#8c7f6e]" />
            <p className="text-sm text-[#8c7f6e]">
              <span className="font-semibold text-[#b5604a]">Click to upload</span>{" "}
              or drag & drop
            </p>
            <p className="text-[11px] text-[#c4b9a8]">MP4, WebM, MOV — max 70 MB</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {uploading && (
        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-[#8c7f6e] mb-1">
            <span>Uploading…</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#e0d6c8] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#b5604a] rounded-full transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 text-[12px] text-[#b5604a] bg-[rgba(181,96,74,0.06)] border border-[#e8b4a4] px-3 py-2 rounded-md">
          {error}
        </div>
      )}

      {sortedVideos.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          {sortedVideos.map((vid, i) => (
            <div
              key={vid.gcsPath}
              className="group rounded-lg overflow-hidden border border-[#e0d6c8] bg-[#fdfaf5] flex"
            >
              <div className="relative w-40 h-24 shrink-0 bg-black">
                <video
                  src={`${vid.url}#t=0.1`}
                  preload="metadata"
                  className="w-full h-full object-cover"
                  muted
                />
              </div>
              <div className="flex-1 p-3 flex items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {vid.isCover && (
                    <span className="text-[9px] font-bold tracking-[0.14em] uppercase px-1.5 py-0.5 rounded bg-[#b5604a] text-white">
                      Cover
                    </span>
                  )}
                  {vid.isNew && (
                    <span className="text-[9px] font-bold tracking-[0.14em] uppercase px-1.5 py-0.5 rounded bg-[#4a7a6a] text-white">
                      New
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleCover(i)}
                    className={`text-[10px] font-semibold px-2 py-1 rounded transition-all border cursor-pointer ${
                      vid.isCover
                        ? "border-[#b5604a] text-[#b5604a] bg-[rgba(181,96,74,0.06)]"
                        : "border-[#e0d6c8] text-[#8c7f6e] hover:border-[#b5604a] hover:text-[#b5604a]"
                    }`}
                  >
                    <Star size={10} className="inline mr-1" />
                    {vid.isCover ? "Cover Video" : "Set as Cover"}
                  </button>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveVideo(i, -1)}
                    disabled={i === 0}
                    className="w-6 h-6 flex items-center justify-center rounded bg-white border border-[#e0d6c8] text-[#8c7f6e] hover:text-[#2a231a] transition-all disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronUp size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveVideo(i, 1)}
                    disabled={i === sortedVideos.length - 1}
                    className="w-6 h-6 flex items-center justify-center rounded bg-white border border-[#e0d6c8] text-[#8c7f6e] hover:text-[#2a231a] transition-all disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronDown size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(i)}
                    className="w-6 h-6 flex items-center justify-center rounded bg-white border border-[#e0d6c8] text-[#b5604a] hover:bg-[rgba(181,96,74,0.06)] transition-all cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
