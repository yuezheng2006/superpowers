"use client";

import ReactPlayer from "react-player";

type UniversalPlayerProps = {
  title: string;
  url: string;
  bvid?: string;
};

function isBilibiliUrl(url: string) {
  return /(^|\.)bilibili\.com\//i.test(url);
}

function bilibiliEmbedUrl(bvid: string) {
  return `https://player.bilibili.com/player.html?bvid=${encodeURIComponent(bvid)}&page=1&high_quality=1`;
}

function getBvid(url: string, bvid?: string) {
  if (bvid) return bvid;
  return url.match(/\/video\/(BV[a-zA-Z0-9]+)/)?.[1] || "";
}

export function UniversalPlayer({ title, url, bvid }: UniversalPlayerProps) {
  const resolvedBvid = getBvid(url, bvid);

  if (resolvedBvid && (bvid || isBilibiliUrl(url))) {
    return (
      <iframe
        title={`Bilibili player: ${title}`}
        src={bilibiliEmbedUrl(resolvedBvid)}
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
      />
    );
  }

  return (
    <ReactPlayer
      src={url}
      controls
      playsInline
      width="100%"
      height="100%"
      className="reactPlayer"
      fallback={<div className="playerFallback">正在加载播放器...</div>}
    />
  );
}
