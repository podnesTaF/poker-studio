"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Loader2,
} from "lucide-react";

function formatTime(seconds: number) {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoPlayer({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (playing) {
      hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playing]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onTimeUpdate = () => setCurrentTime(v.currentTime);
    const onDuration = () => setDuration(v.duration);
    const onEnded = () => {
      setPlaying(false);
      setShowControls(true);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => {
      setPlaying(false);
      setShowControls(true);
    };
    const onWaiting = () => setBuffering(true);
    const onCanPlay = () => setBuffering(false);

    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("durationchange", onDuration);
    v.addEventListener("loadedmetadata", onDuration);
    v.addEventListener("ended", onEnded);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("waiting", onWaiting);
    v.addEventListener("canplay", onCanPlay);

    return () => {
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("durationchange", onDuration);
      v.removeEventListener("loadedmetadata", onDuration);
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("canplay", onCanPlay);
    };
  }, []);

  useEffect(() => {
    const cb = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", cb);
    return () => document.removeEventListener("fullscreenchange", cb);
  }, []);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (!hasStarted) setHasStarted(true);
    v.paused ? v.play() : v.pause();
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  function changeVolume(val: number) {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    setVolume(val);
    if (val === 0) {
      v.muted = true;
      setMuted(true);
    } else if (v.muted) {
      v.muted = false;
      setMuted(false);
    }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    v.currentTime =
      Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration;
  }

  function toggleFullscreen() {
    if (!containerRef.current) return;
    document.fullscreenElement
      ? document.exitFullscreen()
      : containerRef.current.requestFullscreen();
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const controlsVisible = hasStarted && (showControls || !playing);

  return (
    <div
      ref={containerRef}
      className={`relative bg-black overflow-hidden select-none ${className ?? ""}`}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
        preload="metadata"
        onClick={togglePlay}
      />

      {buffering && hasStarted && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 size={36} className="text-white animate-spin" />
        </div>
      )}

      {!playing && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer border-none"
        >
          <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/25 transition-transform hover:scale-110">
            <Play size={28} className="text-white ml-1" fill="white" />
          </div>
        </button>
      )}

      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-3 pt-10 transition-opacity duration-300 ${
          controlsVisible
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Progress bar */}
        <div
          className="w-full h-1 bg-white/20 rounded-full cursor-pointer mb-3 group/seek"
          onClick={seek}
        >
          <div
            className="h-full bg-white rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white scale-0 group-hover/seek:scale-100 transition-transform" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="text-white/90 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0"
            >
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <span className="text-[11px] text-white/60 font-mono tabular-nums whitespace-nowrap">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="text-white/90 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0"
            >
              {muted || volume === 0 ? (
                <VolumeX size={16} />
              ) : (
                <Volume2 size={16} />
              )}
            </button>
            <div
              className="w-16 h-1 bg-white/20 rounded-full cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                changeVolume(
                  Math.max(
                    0,
                    Math.min(1, (e.clientX - rect.left) / rect.width)
                  )
                );
              }}
            >
              <div
                className="h-full bg-white/80 rounded-full"
                style={{ width: `${(muted ? 0 : volume) * 100}%` }}
              />
            </div>
            <button
              onClick={toggleFullscreen}
              className="text-white/90 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0"
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
