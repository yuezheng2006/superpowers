import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";

const outFile = resolve(new URL("../data/catalog.json", import.meta.url).pathname);
const searches = [
  { keyword: "Suno AI 音乐", playlist: "Suno 精选" },
  { keyword: "Suno AI 原创歌曲", playlist: "原创歌曲" },
  { keyword: "AI 音乐 MV Suno", playlist: "AI MV" },
  { keyword: "Suno 教程 AI音乐", playlist: "创作教程" }
];

const seedVideos = [
  { bvid: "BV1z25E69EWB", playlist: "Suno 改编" },
  { bvid: "BV1J2vXBvE3i", playlist: "Suno 改编" },
  { bvid: "BV1CD421A7Nc", playlist: "原创歌曲" },
  { bvid: "BV1fr421t7zz", playlist: "创作实验" },
  { bvid: "BV1wuiyBQEdi", playlist: "创作教程" },
  { bvid: "BV1PAm2B9Ei3", playlist: "创作教程" },
  { bvid: "BV1UNwgeTER8", playlist: "创作教程" },
  { bvid: "BV1rs9bYoEtk", playlist: "创作教程" }
];

const upSpaces = [
  { mid: "1091", name: "需求参考 UP", keywords: ["Suno", "AI音乐", "AI 音乐"] },
  { mid: "314203971", name: "黑蓝墨水就爱搞事儿", keywords: ["Suno", "AI音乐"] },
  { mid: "356809114", name: "Suno教学", keywords: ["Suno", "AI音乐"] }
];

const headers = {
  "user-agent": "Mozilla/5.0 AI-Music-Hub/0.1",
  referer: "https://www.bilibili.com"
};

function stripHtml(input = "") {
  return input.replace(/<[^>]*>/g, "").replace(/&quot;/g, "\"").replace(/&amp;/g, "&").trim();
}

function secondsFromDuration(duration = "") {
  const parts = String(duration).split(":").map(Number);
  if (parts.some(Number.isNaN)) return 0;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

function inferTags(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();
  return [
    text.includes("suno") ? "Suno" : "AI Music",
    text.includes("mv") ? "MV" : null,
    text.includes("教程") || text.includes("教学") ? "教程" : null,
    text.includes("原创") ? "原创" : null,
    text.includes("翻唱") || text.includes("复刻") ? "改编" : null
  ].filter(Boolean);
}

function normalizeSearchItem(item, playlist) {
  const title = stripHtml(item.title);
  const description = stripHtml(item.description);
  return {
    id: item.bvid,
    bvid: item.bvid,
    title,
    author: item.author || "未知 UP",
    authorUrl: item.mid ? `https://space.bilibili.com/${item.mid}` : "",
    url: item.arcurl || `https://www.bilibili.com/video/${item.bvid}`,
    cover: item.pic?.startsWith("//") ? `https:${item.pic}` : item.pic,
    description,
    duration: secondsFromDuration(item.duration),
    publishedAt: item.pubdate ? new Date(item.pubdate * 1000).toISOString() : "",
    stats: {
      views: Number(item.play || 0),
      danmaku: Number(item.video_review || 0),
      favorites: Number(item.favorites || 0)
    },
    tags: inferTags(title, description),
    playlist,
    source: "bilibili-search"
  };
}

async function fetchJson(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  return res.json();
}

async function search(keyword, playlist) {
  const url = new URL("https://api.bilibili.com/x/web-interface/search/type");
  url.searchParams.set("search_type", "video");
  url.searchParams.set("keyword", keyword);
  url.searchParams.set("order", "totalrank");
  url.searchParams.set("duration", "0");
  url.searchParams.set("page", "1");

  const json = await fetchJson(url);
  const results = json?.data?.result || [];
  return results
    .filter((item) => item.bvid && /suno|ai|人工智能|音乐/i.test(`${item.title} ${item.description}`))
    .slice(0, 12)
    .map((item) => normalizeSearchItem(item, playlist));
}

function normalizeImage(url = "") {
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("http://")) return url.replace("http://", "https://");
  return url;
}

const mixinKeyEncTab = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35,
  27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13,
  37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4,
  22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52
];

let cachedMixinKey = "";

function md5(input) {
  return createHash("md5").update(input).digest("hex");
}

function extractKey(url = "") {
  return url.slice(url.lastIndexOf("/") + 1, url.lastIndexOf("."));
}

async function getMixinKey() {
  if (cachedMixinKey) return cachedMixinKey;
  const json = await fetchJson("https://api.bilibili.com/x/web-interface/nav");
  const imgKey = extractKey(json?.data?.wbi_img?.img_url || "");
  const subKey = extractKey(json?.data?.wbi_img?.sub_url || "");
  const raw = `${imgKey}${subKey}`;
  cachedMixinKey = mixinKeyEncTab.map((index) => raw[index]).join("").slice(0, 32);
  if (!cachedMixinKey) throw new Error("Unable to derive Bilibili WBI key");
  return cachedMixinKey;
}

async function signedUrl(base, params) {
  const mixinKey = await getMixinKey();
  const signed = new URL(base);
  const cleanParams = { ...params, wts: Math.round(Date.now() / 1000) };
  const query = Object.keys(cleanParams)
    .sort()
    .map((key) => {
      const value = String(cleanParams[key]).replace(/[!'()*]/g, "");
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join("&");
  signed.search = `${query}&w_rid=${md5(`${query}${mixinKey}`)}`;
  return signed;
}

async function videoByBvid(seed) {
  const bvid = typeof seed === "string" ? seed : seed.bvid;
  const url = new URL("https://api.bilibili.com/x/web-interface/view");
  url.searchParams.set("bvid", bvid);
  const json = await fetchJson(url);
  const item = json?.data;
  if (!item?.bvid) return null;
  return {
    id: item.bvid,
    bvid: item.bvid,
    title: item.title,
    author: item.owner?.name || "未知 UP",
    authorUrl: item.owner?.mid ? `https://space.bilibili.com/${item.owner.mid}` : "",
    url: `https://www.bilibili.com/video/${item.bvid}`,
    cover: normalizeImage(item.pic),
    description: item.desc || "",
    duration: Number(item.duration || 0),
    publishedAt: item.pubdate ? new Date(item.pubdate * 1000).toISOString() : "",
    stats: {
      views: Number(item.stat?.view || 0),
      danmaku: Number(item.stat?.danmaku || 0),
      favorites: Number(item.stat?.favorite || 0)
    },
    tags: inferTags(item.title, item.desc),
    playlist: typeof seed === "string" ? "手动收录" : seed.playlist,
    source: "bilibili-view"
  };
}

async function collectSpaceVideos(space) {
  const items = [];
  for (const keyword of space.keywords) {
    const url = await signedUrl("https://api.bilibili.com/x/space/wbi/arc/search", {
      mid: space.mid,
      pn: 1,
      ps: 30,
      order: "pubdate",
      keyword
    });
    const json = await fetchJson(url);
    const videos = json?.data?.list?.vlist || [];
    for (const video of videos) {
      if (!video.bvid) continue;
      const item = await videoByBvid({ bvid: video.bvid, playlist: `${space.name} · UP 收录` });
      if (item) items.push(item);
    }
  }
  return items;
}

function dedupe(items) {
  const seen = new Map();
  for (const item of items) {
    if (!seen.has(item.bvid)) seen.set(item.bvid, item);
  }
  return [...seen.values()].sort((a, b) => (b.stats.views || 0) - (a.stats.views || 0));
}

async function main() {
  const collected = [];

  for (const seed of seedVideos) {
    try {
      const item = await videoByBvid(seed);
      if (item) collected.push(item);
    } catch (error) {
      console.warn(`Seed fetch failed for ${typeof seed === "string" ? seed : seed.bvid}: ${error.message}`);
    }
  }

  for (const query of searches) {
    try {
      collected.push(...await search(query.keyword, query.playlist));
    } catch (error) {
      console.warn(`Search failed for "${query.keyword}": ${error.message}`);
    }
  }

  for (const space of upSpaces) {
    try {
      collected.push(...await collectSpaceVideos(space));
    } catch (error) {
      console.warn(`Space fetch failed for ${space.name} (${space.mid}): ${error.message}`);
    }
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    source: "Bilibili public web APIs",
    items: dedupe(collected)
  };

  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${payload.items.length} videos to ${outFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
