import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";

const outFile = resolve(new URL("../data/catalog.json", import.meta.url).pathname);

const collectorReferences = [
  {
    name: "simon300000/bili-api",
    url: "https://github.com/simon300000/bili-api",
    usage: "Reviewed its open-source collector model for UP archive traversal and video metadata normalization."
  },
  {
    name: "BiliBiliApi/BiliBiliApi",
    url: "https://github.com/BiliBiliApi/BiliBiliApi",
    usage: "Reviewed its public Bilibili API routing conventions; kept this project dependency-free because npm crawler packages currently add audit risk."
  }
];

const searches = [
  { keyword: "Suno AI 原创歌曲", playlist: "B站 AI 音乐精选", playlistId: "bilibili-ai-music-picks" },
  { keyword: "Suno AI 改编", playlist: "B站 AI 音乐精选", playlistId: "bilibili-ai-music-picks" },
  { keyword: "AI 音乐 MV Suno", playlist: "B站 AI 音乐精选", playlistId: "bilibili-ai-music-picks" }
];

const seedVideos = [
  { bvid: "BV14RqeBPEPU", playlist: "天花板上吊着猫 · Suno 实验", playlistId: "ceiling-cat-suno" },
  { bvid: "BV1osAVzWEmM", playlist: "天花板上吊着猫 · Suno 实验", playlistId: "ceiling-cat-suno" },
  { bvid: "BV1X8sszKEHD", playlist: "天花板上吊着猫 · Suno 实验", playlistId: "ceiling-cat-suno" },
  { bvid: "BV19vsQz2EG9", playlist: "天花板上吊着猫 · Suno 实验", playlistId: "ceiling-cat-suno" },
  { bvid: "BV1BJS6BvERx", playlist: "天花板上吊着猫 · Suno 实验", playlistId: "ceiling-cat-suno" },
  { bvid: "BV1z25E69EWB", playlist: "黑蓝墨水就爱搞事儿 · 老歌翻新", playlistId: "blackblue-remix" },
  { bvid: "BV1J2vXBvE3i", playlist: "所长bibabo · 风格改编", playlistId: "bibabo-style" },
  { bvid: "BV1oKiwBXEaP", playlist: "所长bibabo · 风格改编", playlistId: "bibabo-style" },
  { bvid: "BV16oiyBUEeN", playlist: "所长bibabo · 风格改编", playlistId: "bibabo-style" },
  { bvid: "BV1ho2aB4Exn", playlist: "阿德托昆博 · 黑人福音", playlistId: "adeto-gospel" },
  { bvid: "BV1K32vBdED3", playlist: "阿德托昆博 · 黑人福音", playlistId: "adeto-gospel" },
  { bvid: "BV1nzm7BiEqj", playlist: "阿德托昆博 · 黑人福音", playlistId: "adeto-gospel" },
  { bvid: "BV1SPmuBtEoc", playlist: "阿德托昆博 · 黑人福音", playlistId: "adeto-gospel" },
  { bvid: "BV1X5BxBpEqY", playlist: "阿德托昆博 · 黑人福音", playlistId: "adeto-gospel" },
  { bvid: "BV1b1BBBSEiR", playlist: "阿德托昆博 · 黑人福音", playlistId: "adeto-gospel" },
  { bvid: "BV1zz2XB8EtG", playlist: "阿德托昆博 · 黑人福音", playlistId: "adeto-gospel" },
  { bvid: "BV1JLzQBrEpN", playlist: "阿德托昆博 · 黑人福音", playlistId: "adeto-gospel" },
  { bvid: "BV1Cji5BvEaL", playlist: "阿德托昆博 · 黑人福音", playlistId: "adeto-gospel" },
  { bvid: "BV16nshziEQw", playlist: "夏火ww · R&B 改编", playlistId: "xiahuo-rnb" },
  { bvid: "BV17iDCBLEtW", playlist: "复利大叔 · 星神二创曲", playlistId: "fuli-starrail" },
  { bvid: "BV1DzDxBJET2", playlist: "复利大叔 · 星神二创曲", playlistId: "fuli-starrail" },
  { bvid: "BV15dDSBdEur", playlist: "八十万刁民总教头 · AI 翻唱", playlistId: "chief-ai-cover" },
  { bvid: "BV1ipCgB8Enx", playlist: "B站 AI 音乐精选", playlistId: "bilibili-ai-music-picks" },
  { bvid: "BV1CD421A7Nc", playlist: "B站 AI 音乐精选", playlistId: "bilibili-ai-music-picks" },
  { bvid: "BV1fr421t7zz", playlist: "B站 AI 音乐精选", playlistId: "bilibili-ai-music-picks" },
  { bvid: "BV16x4y1m7Vy", playlist: "B站 AI 音乐精选", playlistId: "bilibili-ai-music-picks" },
  { bvid: "BV1Lz421o7MJ", playlist: "B站 AI 音乐精选", playlistId: "bilibili-ai-music-picks" }
];

const upSpaces = [
  { mid: "1091", name: "天花板上吊着猫", playlist: "天花板上吊着猫 · Suno 实验", playlistId: "ceiling-cat-suno", keywords: ["Suno", "AI音乐", "AI 音乐"] },
  { mid: "314203971", name: "黑蓝墨水就爱搞事儿", playlist: "黑蓝墨水就爱搞事儿 · 老歌翻新", playlistId: "blackblue-remix", keywords: ["Suno", "AI音乐"] },
  { mid: "15687479", name: "所长bibabo", playlist: "所长bibabo · 风格改编", playlistId: "bibabo-style", keywords: ["Suno", "AI音乐"] },
  { mid: "3546657844595574", name: "阿德托昆博带件衣服", playlist: "阿德托昆博 · 黑人福音", playlistId: "adeto-gospel", keywords: ["Suno", "黑人福音"] },
  { mid: "3546682457533247", name: "夏火ww", playlist: "夏火ww · R&B 改编", playlistId: "xiahuo-rnb", keywords: ["Suno", "R&B", "AI改编"] },
  { mid: "5104808", name: "复利大叔", playlist: "复利大叔 · 星神二创曲", playlistId: "fuli-starrail", keywords: ["suno", "AI音乐", "星神二创曲"] }
];

const playlistPlans = [
  {
    id: "ceiling-cat-suno",
    name: "天花板上吊着猫 · Suno 实验",
    curator: "天花板上吊着猫",
    summary: "围绕 Suno V5、流行音乐再创作和 AI 编曲实验的重点收录。",
    status: "已上线",
    plan: "持续补齐该 UP 的 Suno 系列作品，优先收录单曲、改编和完整 MV。"
  },
  {
    id: "blackblue-remix",
    name: "黑蓝墨水就爱搞事儿 · 老歌翻新",
    curator: "黑蓝墨水就爱搞事儿",
    summary: "老歌翻新、电子民谣和 AI 编曲方向的推荐歌单。",
    status: "已上线",
    plan: "继续补充该 UP 的 AI 翻新系列，按曲风和原曲年代拆分子歌单。"
  },
  {
    id: "bibabo-style",
    name: "所长bibabo · 风格改编",
    curator: "所长bibabo",
    summary: "突出风格迁移、声部编排和热门作品再创作的 Suno 歌单。",
    status: "已上线",
    plan: "补齐更多风格实验作品，并增加提示词/风格标签。"
  },
  {
    id: "adeto-gospel",
    name: "阿德托昆博 · 黑人福音",
    curator: "阿德托昆博带件衣服",
    summary: "高播放黑人福音、R&B、Soul 改编方向，适合做风格示范歌单。",
    status: "已上线",
    plan: "继续沿 UP 主更新节奏补充高收藏版本，并按 Gospel / R&B / Soul 拆分。"
  },
  {
    id: "xiahuo-rnb",
    name: "夏火ww · R&B 改编",
    curator: "夏火ww",
    summary: "站内传播度高的中文流行 R&B 改编作品。",
    status: "已上线",
    plan: "从播放量和收藏量双维度补齐该 UP 的 R&B 改编系列。"
  },
  {
    id: "fuli-starrail",
    name: "复利大叔 · 星神二创曲",
    curator: "复利大叔",
    summary: "围绕游戏叙事和角色世界观创作的高完成度 AI 音乐。",
    status: "已上线",
    plan: "优先收录完整歌曲，剔除纯剧情解析和非音乐内容。"
  },
  {
    id: "chief-ai-cover",
    name: "八十万刁民总教头 · AI 翻唱",
    curator: "八十万刁民总教头",
    summary: "高播放 AI 翻唱与黑人声线改编作品。",
    status: "已上线",
    plan: "按播放和收藏补齐热门翻唱，保留版权提示清晰的条目。"
  },
  {
    id: "bilibili-ai-music-picks",
    name: "B站 AI 音乐精选",
    curator: "AI Music Hub",
    summary: "站内高播放、适合试听的 AI 音乐作品，只收歌曲和音乐实验。",
    status: "扩充中",
    plan: "下一步加入更多知名 UP，并剔除工具讲解、账号引流和非歌曲内容。"
  }
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

function isMusicWork(title = "", description = "") {
  const text = `${title} ${description}`.toLowerCase();
  const negative = /教程|教学|课程|入门|零基础|提示词|保姆级|手把手|使用教程|开箱|到手|耳机|airpods|攻略|登录|账号|变现|全流程干货|工具|iphone|ipad|op-1|合成器|科普|听写神器|上手/i;
  const positive = /suno|ai音乐|ai 音乐|ai翻唱|ai 翻唱|ai改编|ai 改编|原创ai|原创 ai|suno音乐|cover|翻唱|黑人福音|r&b|soul|citypop|neo soul|曲：suno|powered by suno/i;
  return positive.test(text) && !negative.test(text);
}

function passesQualityBar(item) {
  return Number(item?.stats?.views || 0) >= 1000;
}

function normalizeSearchItem(item, seed) {
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
    playlist: seed.playlist,
    playlistId: seed.playlistId,
    source: "bilibili-search"
  };
}

async function fetchJson(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  return res.json();
}

async function search(query) {
  const url = new URL("https://api.bilibili.com/x/web-interface/search/type");
  url.searchParams.set("search_type", "video");
  url.searchParams.set("keyword", query.keyword);
  url.searchParams.set("order", "totalrank");
  url.searchParams.set("duration", "0");
  url.searchParams.set("page", "1");

  const json = await fetchJson(url);
  const results = json?.data?.result || [];
  return results
    .filter((item) => item.bvid && /suno|ai|人工智能|音乐/i.test(`${item.title} ${item.description}`))
    .filter((item) => isMusicWork(item.title, item.description))
    .slice(0, 12)
    .map((item) => normalizeSearchItem(item, query));
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
    playlistId: typeof seed === "string" ? "" : seed.playlistId,
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
      if (!isMusicWork(video.title, video.description)) continue;
      const item = await videoByBvid({ bvid: video.bvid, playlist: space.playlist, playlistId: space.playlistId });
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
      collected.push(...await search(query));
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
    source: "Bilibili public web APIs + GitHub open-source collector references",
    collectorReferences,
    playlists: playlistPlans,
    items: dedupe(collected).filter((item) => isMusicWork(item.title, item.description) && passesQualityBar(item))
  };

  await mkdir(dirname(outFile), { recursive: true });
  await writeFile(outFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${payload.items.length} videos to ${outFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
