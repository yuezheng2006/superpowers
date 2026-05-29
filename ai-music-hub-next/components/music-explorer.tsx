"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

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
  const playlistTrackCounts = useMemo(
    () =>
      new Map(
        playlists.map((playlist) => [
          playlist.id,
          tracks.filter((track) => track.playlistId === playlist.id).length,
        ]),
      ),
    [playlists, tracks],
  );
  const visiblePlaylists = useMemo(
    () => playlists.filter((playlist) => (playlistTrackCounts.get(playlist.id) || 0) > 0),
    [playlistTrackCounts, playlists],
  );
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
  const [draftQuery, setDraftQuery] = useState("");

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

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery(draftQuery);
  }

  return (
    <main className="desktopShell">
      <header className="topbar">
        <div>
          <h1>AI Music Hub</h1>
          <p className="topMeta">{authors.length} UP / {visiblePlaylists.length} 歌单 / {tracks.length} 单曲</p>
        </div>
        <form className="search" onSubmit={submitSearch}>
          <Search aria-hidden="true" size={18} />
          <input
            value={draftQuery}
            onChange={(event) => {
              setDraftQuery(event.target.value);
              setQuery(event.target.value);
            }}
            type="search"
            placeholder="搜索歌曲、UP、标签"
            aria-label="搜索歌曲、UP、标签"
          />
          <button type="submit">搜索</button>
        </form>
      </header>

      <div className="desktopWorkspace">
        <div className="sideStack">
          <section className="compactSection" aria-label="UP 主">
            <div className="sectionHead">
              <h2>UP 主</h2>
            </div>
            <div className="authorRail">
              <button type="button" className="authorChip" aria-pressed={author === "all"} onClick={() => setAuthor("all")}>
                <span>全部 UP</span>
                <span>{tracks.length}</span>
              </button>
              {authors.map((item) => (
                <button
                  type="button"
                  className="authorChip"
                  aria-pressed={author === item.name}
                  key={item.name}
                  onClick={() => setAuthor(item.name)}
                >
                  <span>{item.name}</span>
                  <span>{item.count}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="compactSection sidePlaylists" aria-label="歌单">
            <div className="sectionHead">
              <h2>歌单</h2>
            </div>
            <div className="playlistCards">
              <button className="playlistCard" type="button" aria-pressed={playlistId === "all"} onClick={() => setPlaylistId("all")}>
                <h3>全部推荐</h3>
                <div className="playlistMeta">
                  <span>{tracks.length} 首</span>
                </div>
              </button>
              {visiblePlaylists.map((playlist) => (
                <button
                  className="playlistCard"
                  key={playlist.id}
                  type="button"
                  aria-pressed={playlist.id === playlistId}
                  onClick={() => setPlaylistId(playlist.id)}
                >
                  <h3>{playlist.name}</h3>
                  <div className="playlistMeta">
                    <span>{playlistTrackCounts.get(playlist.id) || 0} 首</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        <section className="compactSection trackPane">
          <div className="sectionHead">
            <h2>单曲</h2>
            <p>{filtered.length} 首</p>
          </div>
          {filtered.length ? (
            <div className="trackList">
              {filtered.map((track) => (
                <Link className="trackRow" href={`/tracks/${track.id}`} key={track.id} aria-label={`播放 ${track.title}`}>
                  <span className="rowCover">
                    {track.cover ? <img src={coverSrc(track.cover)} alt={track.title} /> : null}
                  </span>
                  <span className="rowTitle">{track.title}</span>
                  <span className="rowAuthor">{track.author}</span>
                  <span className="rowPlaylist">{track.playlist || "未分组"}</span>
                  <span className="rowDuration">{formatDuration(track.duration)}</span>
                  <span className="rowViews">{formatNumber(track.stats?.views)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty">没有匹配的作品。可以换一个关键词，或切换到全部推荐歌单。</div>
          )}
        </section>
      </div>
    </main>
  );
}
