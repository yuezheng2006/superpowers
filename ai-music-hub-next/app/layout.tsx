import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Music Hub",
  description: "一期聚焦 B 站 Suno / AI 音乐内容的聚合播放网站"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
