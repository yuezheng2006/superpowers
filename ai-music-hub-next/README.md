# AI Music Hub Next

基于 Next.js App Router 的 B 站 Suno / AI 音乐聚合播放站点。页面聚焦 UP 主、歌单、单曲和站内播放详情。

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

采集脚本会通过 Bilibili 公开视频、空间接口和审核过的高质量 BVID 种子刷新 `data/catalog.json`。如果搜索或空间接口被限流，脚本仍会保留人审种子曲库。

数据收集策略参考了 GitHub 上的开源 B 站采集项目：

- `simon300000/bili-api`：参考 UP archive 遍历和视频元数据归一化模型。
- `BiliBiliApi/BiliBiliApi`：参考公开接口路由约定。

没有把这些包直接加入生产依赖，因为现有 npm 采集包会带来不可自动修复的依赖审计风险。当前实现保留零新增生产漏洞，并在脚本里使用更严格的作品过滤和播放量质量线。

## 说明

- 播放器封装在 `components/universal-player.tsx`：Bilibili 使用官方外链 iframe，不抽取原始音视频地址；YouTube、HLS、DASH 和通用媒体 URL 使用开源 `react-player`。
- 当前一期聚焦 Suno / AI 音乐内容，后续可以继续扩展关键词、UP 主和人工审核规则。
