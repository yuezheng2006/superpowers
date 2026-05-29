"use client";

import { Music2, Play, Search, UserRound } from "lucide-react";
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

  function playlistCount(id: string) {
    return tracks.filter((track) => track.playlistId === id).length;
  }

  return (
    <main className="desktopShell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Bilibili Suno Radar</p>
          <h1>AI Music Hub</h1>
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

      <section className="summaryStrip" aria-label="曲库概览">
        <div>
          <span>UP 主</span>
          <strong>{authors.length}</strong>
        </div>
        <div>
          <span>歌单</span>
          <strong>{playlists.length}</strong>
        </div>
        <div>
          <span>单曲</span>
          <strong>{tracks.length}</strong>
        </div>
      </section>

      <div className="desktopWorkspace">
        <div className="sideStack">
          <section className="compactSection" aria-label="UP 主">
            <div className="sectionHead">
              <h2>UP 主</h2>
            </div>
            <div className="authorRail">
              <button type="button" className="authorChip" aria-pressed={author === "all"} onClick={() => setAuthor("all")}>
                <UserRound aria-hidden="true" size={15} />
                全部
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
                  <UserRound aria-hidden="true" size={15} />
                  {item.name}
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
                <span className="playlistStatus">全部</span>
                <h3>全部推荐</h3>
                <div className="playlistMeta">
                  <span>AI Music Hub</span>
                  <span>{tracks.length} 首</span>
                </div>
              </button>
            {playlists.map((playlist) => (
              <button
                className="playlistCard"
                key={playlist.id}
                type="button"
                aria-pressed={playlist.id === playlistId}
                onClick={() => setPlaylistId(playlist.id)}
              >
                <span className="playlistStatus">{playlist.status}</span>
                <h3>{playlist.name}</h3>
                <div className="playlistMeta">
                  <span>{playlist.curator}</span>
                  <span>{playlistCount(playlist.id)} 首</span>
                </div>
              </button>
            ))}
            </div>
          </section>
        </div>

        <section className="compactSection trackPane">
          <div className="sectionHead">
            <h2>单曲</h2>
            <p>{filtered.length} / {tracks.length}</p>
          </div>
          {filtered.length ? (
            <div className="grid">
              {filtered.map((track) => (
                <article className="trackCard" key={track.id}>
                  <Link className="coverButton" href={`/tracks/${track.id}`} aria-label={`播放 ${track.title}`}>
                    {track.cover ? <img src={coverSrc(track.cover)} alt={track.title} /> : null}
                    <span className="playBadge">
                      <Play aria-hidden="true" size={13} />
                      播放
                    </span>
                  </Link>
                  <div className="trackBody">
                    <h3>
                      <Link href={`/tracks/${track.id}`}>{track.title}</Link>
                    </h3>
                    <div className="trackFoot">
                      <span>
                        <Music2 aria-hidden="true" size={13} />
                        {track.author}
                      </span>
                      <span>{formatDuration(track.duration)}</span>
                      <span>{formatNumber(track.stats?.views)} 播放</span>
                    </div>
                  </div>
                </article>
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
