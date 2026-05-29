import { ArrowLeft, Clock, Heart, Play, Radio } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import catalog from "../../../data/catalog.json";
import { UniversalPlayer } from "../../../components/universal-player";

type Track = {
  id: string;
  bvid: string;
  title: string;
  author: string;
  url: string;
  cover?: string;
  description?: string;
  duration?: number;
  publishedAt?: string;
  stats?: {
    views?: number;
    favorites?: number;
  };
  tags?: string[];
  playlist?: string;
  playlistId?: string;
};

type Catalog = {
  playlists?: Array<{
    id: string;
    name: string;
    summary: string;
    plan: string;
  }>;
  items: Track[];
};

const typedCatalog = catalog as Catalog;

function coverSrc(url?: string) {
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

export function generateStaticParams() {
  return typedCatalog.items.map((track) => ({ id: track.id }));
}

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const track = typedCatalog.items.find((item) => item.id === id);
  if (!track) notFound();

  const playlist = typedCatalog.playlists?.find((item) => item.id === track.playlistId);
  const related = typedCatalog.items
    .filter((item) => item.id !== track.id && item.playlistId === track.playlistId)
    .slice(0, 4);

  return (
    <main className="detailShell">
      <header className="detailTopbar">
        <Link className="backLink" href="/">
          <ArrowLeft aria-hidden="true" size={18} />
          返回作品库
        </Link>
      </header>

      <section className="detailDesk" aria-label="播放详情">
        <div className="detailMain">
          <div className="detailCopy">
            <p className="eyebrow">{track.playlist}</p>
            <h1>{track.title}</h1>
            <p>{track.description}</p>
            <div className="detailMeta">
              <span>
                <Radio aria-hidden="true" size={16} />
                {track.author}
              </span>
              <span>
                <Clock aria-hidden="true" size={16} />
                {formatDuration(track.duration)}
              </span>
              <span>
                <Play aria-hidden="true" size={16} />
                {formatNumber(track.stats?.views)} 播放
              </span>
              <span>
                <Heart aria-hidden="true" size={16} />
                {formatNumber(track.stats?.favorites)} 收藏
              </span>
            </div>
          </div>
          <div className="embedWrap">
            <UniversalPlayer title={track.title} url={track.url} bvid={track.bvid} />
          </div>
        </div>

        <aside className="detailSide">
          <div className="detailCover">
            {track.cover ? <img src={coverSrc(track.cover)} alt={track.title} /> : null}
          </div>
          <div className="playlistInfo">
            <p className="eyebrow">歌单计划</p>
            <h2>{playlist?.name || track.playlist}</h2>
            <p>{playlist?.summary}</p>
            <p>{playlist?.plan}</p>
            <span>发布：{formatDate(track.publishedAt)}</span>
          </div>
          {related.length ? (
            <div className="relatedBlock">
              <div className="sectionHead">
                <h2>同歌单作品</h2>
              </div>
              <div className="relatedList">
                {related.map((item) => (
                  <Link className="relatedItem" href={`/tracks/${item.id}`} key={item.id}>
                    {item.cover ? <img src={coverSrc(item.cover)} alt={item.title} /> : null}
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
