# AI Music Hub Next

基于 Next.js App Router 的 B 站 Suno / AI 音乐聚合播放站点。页面内置作品库、歌单筛选、搜索、排序、Bilibili 播放、打开原链接和复制链接。

## 使用

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

## 更新曲库

```bash
npm run collect
```

采集脚本会通过 Bilibili 公开视频和空间接口刷新 `data/catalog.json`。如果搜索接口被限流，脚本仍会用审核过的 BVID 和 UP 空间路径产出曲库。

## 说明

- 播放器封装在 `components/universal-player.tsx`：Bilibili 使用官方外链 iframe，不抽取原始音视频地址；YouTube、HLS、DASH 和通用媒体 URL 使用开源 `react-player`。
- 当前一期聚焦 Suno / AI 音乐内容，后续可以继续扩展关键词、UP 主和人工审核规则。
