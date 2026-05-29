"use client";

import { ListMusic, Play, Search } from "lucide-react";
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

type SortKey = "views" | "newest" | "favorites" | "duration";

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

function formatDate(value?: string) {
  if (!value) return "未知时间";
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(new Date(value));
}

export function MusicExplorer({ catalog }: { catalog: Catalog }) {
  const tracks = useMemo(() => catalog.items.filter((item) => item.bvid), [catalog.items]);
  const playlists = catalog.playlists || [];
  const [playlistId, setPlaylistId] = useState("all");
  const [query, setQuery] = useState("");
  const [draftQuery, setDraftQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("views");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tracks
      .filter((track) => playlistId === "all" || track.playlistId === playlistId)
      .filter((track) => {
        if (!normalizedQuery) return true;
        return [track.title, track.author, track.description, track.playlist, ...(track.tags || [])]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (sort === "newest") return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
        if (sort === "favorites") return (b.stats?.favorites || 0) - (a.stats?.favorites || 0);
        if (sort === "duration") return (b.duration || 0) - (a.duration || 0);
        return (b.stats?.views || 0) - (a.stats?.views || 0);
      });
  }, [playlistId, query, sort, tracks]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery(draftQuery);
  }

  function playlistCount(id: string) {
    return tracks.filter((track) => track.playlistId === id).length;
  }

  return (
    <main>
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

      <section className="heroBand" aria-label="推荐歌单">
        <div className="heroCopy">
          <p className="eyebrow">推荐歌单</p>
          <h2>知名 UP 的 Suno / AI 音乐作品库</h2>
          <p>首页只展示可播放作品和歌单计划，工具课、账号引流和非歌曲内容已从当前曲库移除。</p>
        </div>
        <div className="heroStats">
          <span>{playlists.length} 个歌单</span>
          <strong>{tracks.length}</strong>
          <span>首种子作品</span>
        </div>
      </section>

      <section className="playlistCards" aria-label="歌单计划">
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
            <p>{playlist.summary}</p>
            <div className="playlistMeta">
              <span>{playlist.curator}</span>
              <span>{playlistCount(playlist.id)} 首</span>
            </div>
            <div className="playlistPlan">
              <ListMusic aria-hidden="true" size={16} />
              <span>{playlist.plan}</span>
            </div>
          </button>
        ))}
      </section>

      <section className="controls" aria-label="筛选">
        <div>
          <label htmlFor="playlistSelect">歌单</label>
          <select id="playlistSelect" value={playlistId} onChange={(event) => setPlaylistId(event.target.value)}>
            <option value="all">全部推荐歌单</option>
            {playlists.map((playlist) => (
              <option key={playlist.id} value={playlist.id}>
                {playlist.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sortSelect">排序</label>
          <select id="sortSelect" value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
            <option value="views">播放量</option>
            <option value="newest">发布时间</option>
            <option value="favorites">收藏数</option>
            <option value="duration">时长</option>
          </select>
        </div>
        <div className="statline">
          {filtered.length} 首 / {tracks.length} 首
        </div>
      </section>

      <section>
        <div className="sectionHead">
          <h2>作品库</h2>
          <p>曲库更新：{formatDate(catalog.generatedAt)}</p>
        </div>
        {filtered.length ? (
          <div className="grid">
            {filtered.map((track) => (
              <article className="trackCard" key={track.id}>
                <Link className="coverButton" href={`/tracks/${track.id}`} aria-label={`播放 ${track.title}`}>
                  {track.cover ? <img src={coverSrc(track.cover)} alt={track.title} /> : null}
                  <span className="playBadge">
                    <Play aria-hidden="true" size={13} />
                    播放详情
                  </span>
                </Link>
                <div className="trackBody">
                  <div className="trackTags">
                    {(track.tags || []).slice(0, 3).map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3>
                    <Link href={`/tracks/${track.id}`}>{track.title}</Link>
                  </h3>
                  <p className="desc">{track.description || `${track.playlist || "AI 音乐"} · ${formatDuration(track.duration)}`}</p>
                  <div className="trackFoot">
                    <span>{track.author}</span>
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
    </main>
  );
}
