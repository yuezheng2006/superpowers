"use client";

import { Clipboard, ExternalLink, Play, Search } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { UniversalPlayer } from "./universal-player";

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
  source?: string;
};

export type Catalog = {
  generatedAt: string;
  source: string;
  items: Track[];
};

type SortKey = "views" | "newest" | "favorites" | "duration";

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
  const [playlist, setPlaylist] = useState("全部");
  const [query, setQuery] = useState("");
  const [draftQuery, setDraftQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("views");
  const [copied, setCopied] = useState(false);

  const playlistEntries = useMemo(() => {
    const counts = new Map<string, number>([["全部", tracks.length]]);
    for (const track of tracks) {
      const name = track.playlist || "未分组";
      counts.set(name, (counts.get(name) || 0) + 1);
    }
    return [...counts.entries()];
  }, [tracks]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tracks
      .filter((track) => playlist === "全部" || track.playlist === playlist)
      .filter((track) => {
        if (!normalizedQuery) return true;
        return [
          track.title,
          track.author,
          track.description,
          track.playlist,
          ...(track.tags || [])
        ]
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
  }, [playlist, query, sort, tracks]);

  const [activeId, setActiveId] = useState(tracks[0]?.id || "");
  const active = tracks.find((track) => track.id === activeId) || filtered[0] || tracks[0];

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery(draftQuery);
  }

  async function copyLink() {
    if (!active) return;
    await navigator.clipboard.writeText(active.url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
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

      {active ? (
        <section className="playerShell" aria-label="播放器">
          <div className="playerCopy">
            <p className="now">正在播放</p>
            <h2>{active.title}</h2>
            <p>
              {active.author} · {formatDuration(active.duration)} · {formatNumber(active.stats?.views)} 播放 ·{" "}
              {formatDate(active.publishedAt)}
            </p>
            <div className="actions">
              <a href={active.url} target="_blank" rel="noreferrer">
                <ExternalLink aria-hidden="true" size={17} />
                打开 B 站
              </a>
              <button type="button" onClick={copyLink}>
                <Clipboard aria-hidden="true" size={17} />
                {copied ? "已复制" : "复制链接"}
              </button>
            </div>
          </div>
          <div className="embedWrap">
            <UniversalPlayer title={active.title} url={active.url} bvid={active.bvid} />
          </div>
        </section>
      ) : null}

      <section className="controls" aria-label="筛选">
        <div>
          <label htmlFor="playlistSelect">歌单</label>
          <select id="playlistSelect" value={playlist} onChange={(event) => setPlaylist(event.target.value)}>
            {playlistEntries.map(([name]) => (
              <option key={name} value={name}>
                {name}
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

      <section className="layout">
        <aside className="playlistPanel">
          <h2>歌单集合</h2>
          <div className="playlistList">
            {playlistEntries.map(([name, count]) => (
              <button
                key={name}
                className="playlistItem"
                type="button"
                aria-pressed={name === playlist}
                onClick={() => setPlaylist(name)}
              >
                <span>{name}</span>
                <span>{count}</span>
              </button>
            ))}
          </div>
        </aside>
        <section>
          <div className="sectionHead">
            <h2>作品库</h2>
            <p>曲库更新：{formatDate(catalog.generatedAt)}</p>
          </div>
          {filtered.length ? (
            <div className="grid">
              {filtered.map((track) => (
                <article className="trackCard" key={track.id}>
                  <button className="coverButton" type="button" onClick={() => setActiveId(track.id)}>
                    {track.cover ? <img src={track.cover} alt={track.title} /> : null}
                    <span className="playBadge">
                      <Play aria-hidden="true" size={13} />
                      播放
                    </span>
                  </button>
                  <div className="trackBody">
                    <div className="trackTags">
                      {(track.tags || []).slice(0, 3).map((tag) => (
                        <span className="tag" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3>{track.title}</h3>
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
            <div className="empty">没有匹配的作品。可以换一个关键词，或运行 npm run collect 刷新曲库。</div>
          )}
        </section>
      </section>
    </main>
  );
}
