"use client";

import { Music2, Play, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { FormEvent, useMemo, useState, useEffect } from "react";
import { GlobalPlayer } from "./global-player";
import { LyricsPanel } from "./lyrics-panel";

export type PlaylistPlan = {
  id: string;
  name: string;
  curator: string;
  summary: string;
  status: string;
  plan: string;
};

export type Track = {
  id: string;
  bvid: string;
  title: string;
  author: string;
  authorUrl?: string;
  url: string;
  cover?: string;
  description?: string;
  duration?: number;
  publishedAt?: string;
  stats?: {
    views?: number;
    danmaku?: number;
    favorites?: number;
  };
  tags?: string[];
  playlist?: string;
  playlistId?: string;
  source?: string;
  lyrics?: string;
};

export type Catalog = {
  generatedAt: string;
  source: string;
  playlists?: PlaylistPlan[];
  items: Track[];
};

export function coverSrc(url?: string) {
  if (!url) return "";
  return `/api/cover?url=${encodeURIComponent(url)}`;
}

function formatNumber(value = 0) {
  if (value >= 10000) return `${(value / 10000).toFixed(value >= 100000 ? 0 : 1)}万`;
  return value.toLocaleString("zh-CN");
}

function formatDuration(seconds = 0) {
  if (!seconds) return "未知时长";
  const mins = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

export function MusicExplorer({ catalog }: { catalog: Catalog }) {
  const tracks = useMemo(() => catalog.items.filter((item) => item.bvid), [catalog.items]);
  const playlists = catalog.playlists || [];
  const authors = useMemo(
    () =>
      Array.from(new Set(tracks.map((track) => track.author))).map((author) => ({
        name: author,
        count: tracks.filter((track) => track.author === author).length,
      })),
    [tracks],
  );
  const [playlistId, setPlaylistId] = useState("all");
  const [author, setAuthor] = useState("all");
  const [query, setQuery] = useState("");
  const [currentTrackId, setCurrentTrackId] = useState<string | undefined>();
  const [currentTime, setCurrentTime] = useState(0);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tracks
      .filter((track) => playlistId === "all" || track.playlistId === playlistId)
      .filter((track) => author === "all" || track.author === author)
      .filter((track) => {
        if (!normalizedQuery) return true;
        return [track.title, track.author, track.description, track.playlist, ...(track.tags || [])]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0));
  }, [author, playlistId, query, tracks]);

  function playlistCount(id: string) {
    return tracks.filter((track) => track.playlistId === id).length;
  }

  const currentTrack = currentTrackId ? tracks.find(t => t.id === currentTrackId) : undefined;

  // Auto-play first track if no selection
  useEffect(() => {
    if (!currentTrackId && filtered.length > 0) {
      setCurrentTrackId(filtered[0].id);
    }
  }, [filtered, currentTrackId]);

  // Track playback time for lyrics synchronization
  useEffect(() => {
    if (!currentTrack) {
      setCurrentTime(0);
      return;
    }

    const timer = setInterval(() => {
      setCurrentTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentTrack]);

  // Get playlists filtered by selected author
  const filteredPlaylists = useMemo(() => {
    if (author === "all") return playlists;
    return playlists.filter(playlist => {
      const playlistTracks = tracks.filter(t => t.playlistId === playlist.id);
      return playlistTracks.some(t => t.author === author);
    });
  }, [author, playlists, tracks]);

  return (
    <main className="modernShell">
      <div className="appHeader">
        <div className="headerLeft">
          <h1 className="appTitle">AI Music Hub</h1>
          <div className="headerStats">
            <span>{tracks.length} 首歌曲</span>
            <span className="dot">·</span>
            <span>{authors.length} 位创作者</span>
          </div>
        </div>
        <div className="headerSearch">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="搜索歌曲或创作者..."
            aria-label="搜索"
          />
        </div>
      </div>

      <div className="appBody threeColumn">
        {/* Left Column: Creator List */}
        <aside className="creatorColumn">
          <h3 className="columnTitle">创作者</h3>
          <div className="creatorList">
            <button
              className={`creatorItem ${author === "all" ? "active" : ""}`}
              onClick={() => {
                setAuthor("all");
                setPlaylistId("all");
              }}
            >
              <UserRound size={16} />
              <span>全部创作者</span>
              <span className="itemCount">{tracks.length}</span>
            </button>
            {authors.map((item) => (
              <button
                key={item.name}
                className={`creatorItem ${author === item.name ? "active" : ""}`}
                onClick={() => {
                  setAuthor(item.name);
                  setPlaylistId("all");
                }}
              >
                <UserRound size={16} />
                <span>{item.name}</span>
                <span className="itemCount">{item.count}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Middle Column: Playlist List */}
        <aside className="playlistColumn">
          <h3 className="columnTitle">
            {author === "all" ? "所有歌单" : `${author} 的歌单`}
          </h3>
          <div className="playlistList">
            <button
              className={`playlistItem ${playlistId === "all" ? "active" : ""}`}
              onClick={() => setPlaylistId("all")}
            >
              <Music2 size={16} />
              <span>全部歌曲</span>
              <span className="itemCount">{filtered.length}</span>
            </button>
            {filteredPlaylists.map((playlist) => (
              <button
                key={playlist.id}
                className={`playlistItem ${playlistId === playlist.id ? "active" : ""}`}
                onClick={() => setPlaylistId(playlist.id)}
              >
                <Music2 size={16} />
                <span>{playlist.name}</span>
                <span className="itemCount">{playlistCount(playlist.id)}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Right Column: Content and Playback Area */}
        <div className="contentColumn">
          {currentTrack && (
            <div className="playerAndLyricsArea">
              <div className="videoPlayerArea">
                <div className="videoPlayerContainer">
                  <iframe
                    key={currentTrack.id}
                    title={`播放: ${currentTrack.title}`}
                    src={`https://player.bilibili.com/player.html?bvid=${encodeURIComponent(currentTrack.bvid)}&page=1&high_quality=1&autoplay=0`}
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                  />
                </div>
                <div className="videoPlayerInfo">
                  <h3 className="videoPlayerTitle">{currentTrack.title}</h3>
                  <p className="videoPlayerMeta">{currentTrack.author} · {formatNumber(currentTrack.stats?.views)} 播放</p>
                </div>
              </div>
              <LyricsPanel
                lrcContent={currentTrack.lyrics || null}
                currentTime={currentTime}
                isPlaying={true}
              />
            </div>
          )}

          <div className="contentHeader">
            <h2 className="contentTitle">
              {playlistId === "all" ? "播放列表" : playlists.find(p => p.id === playlistId)?.name || "歌曲列表"}
            </h2>
            <span className="contentCount">{filtered.length} 首</span>
          </div>

          {filtered.length ? (
            <div className="trackList">
              {filtered.map((track, index) => (
                <button
                  key={track.id}
                  className={`trackRow ${currentTrackId === track.id ? "playing" : ""}`}
                  onClick={() => setCurrentTrackId(track.id)}
                >
                  <div className="trackIndex">
                    {currentTrackId === track.id ? (
                      <div className="playingIndicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    ) : (
                      <span className="indexNumber">{index + 1}</span>
                    )}
                  </div>
                  <div className="trackCover">
                    {track.cover ? (
                      <img src={coverSrc(track.cover)} alt="" />
                    ) : (
                      <div className="coverPlaceholder">
                        <Music2 size={20} />
                      </div>
                    )}
                    <div className="coverOverlay">
                      <Play size={16} />
                    </div>
                  </div>
                  <div className="trackInfo">
                    <div className="trackTitle">{track.title}</div>
                    <div className="trackMeta">{track.author}</div>
                  </div>
                  <div className="trackDuration">{formatDuration(track.duration)}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="emptyState">
              <Music2 size={48} />
              <p>没有找到匹配的歌曲</p>
            </div>
          )}
        </div>
      </div>

      <GlobalPlayer
        tracks={filtered}
        currentTrackId={currentTrackId}
        onTrackChange={setCurrentTrackId}
      />
    </main>
  );
}
