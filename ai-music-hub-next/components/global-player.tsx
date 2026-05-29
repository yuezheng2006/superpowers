"use client";

import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Track } from "./music-explorer";

type GlobalPlayerProps = {
  tracks: Track[];
  currentTrackId?: string;
  onTrackChange?: (trackId: string) => void;
};

function getBilibiliEmbedUrl(bvid: string) {
  return `https://player.bilibili.com/player.html?bvid=${encodeURIComponent(bvid)}&page=1&high_quality=1&autoplay=1`;
}

export function GlobalPlayer({ tracks, currentTrackId, onTrackChange }: GlobalPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (currentTrackId) {
      const index = tracks.findIndex((t) => t.id === currentTrackId);
      if (index !== -1) {
        setCurrentIndex(index);
        setIsPlaying(true);
      }
    }
  }, [currentTrackId, tracks]);

  const currentTrack = tracks[currentIndex];

  const playNext = () => {
    const nextIndex = (currentIndex + 1) % tracks.length;
    setCurrentIndex(nextIndex);
    setIsPlaying(true);
    onTrackChange?.(tracks[nextIndex].id);
  };

  const playPrevious = () => {
    const prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    setIsPlaying(true);
    onTrackChange?.(tracks[prevIndex].id);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!currentTrack) return null;

  return (
    <div className="globalPlayer">
      <div className="playerContent">
        <div className="playerInfo">
          <div className="trackInfo">
            <h3>{currentTrack.title}</h3>
            <p>{currentTrack.author}</p>
          </div>
        </div>

        <div className="playerControls">
          <button
            type="button"
            className="controlBtn"
            onClick={playPrevious}
            aria-label="上一首"
          >
            <SkipBack size={20} />
          </button>

          <button
            type="button"
            className="controlBtn playBtn"
            onClick={togglePlay}
            aria-label={isPlaying ? "暂停" : "播放"}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          <button
            type="button"
            className="controlBtn"
            onClick={playNext}
            aria-label="下一首"
          >
            <SkipForward size={20} />
          </button>
        </div>

        <div className="playerRight">
          <button
            type="button"
            className="controlBtn"
            onClick={toggleMute}
            aria-label={isMuted ? "取消静音" : "静音"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>

      <div className="playerEmbed">
        {isPlaying && currentTrack.bvid && (
          <iframe
            ref={iframeRef}
            key={currentTrack.id}
            title={`播放: ${currentTrack.title}`}
            src={getBilibiliEmbedUrl(currentTrack.bvid)}
            allow="autoplay; fullscreen"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          />
        )}
      </div>
    </div>
  );
}
