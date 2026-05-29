import { NextRequest, NextResponse } from "next/server";

const allowedHosts = new Set(["i0.hdslb.com", "i1.hdslb.com", "i2.hdslb.com", "i3.hdslb.com", "i4.hdslb.com"]);

function fallbackCover() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#12231d"/>
      <stop offset="0.55" stop-color="#1a1715"/>
      <stop offset="1" stop-color="#33231b"/>
    </linearGradient>
  </defs>
  <rect width="640" height="360" fill="url(#bg)"/>
  <circle cx="512" cy="84" r="86" fill="#39c6a6" opacity=".18"/>
  <circle cx="132" cy="288" r="118" fill="#f0744f" opacity=".16"/>
  <path d="M215 223c47-34 86-34 132 0 32 24 61 24 94 0" fill="none" stroke="#f0c857" stroke-width="12" stroke-linecap="round"/>
  <text x="42" y="78" fill="#f4f5f0" font-family="Arial, sans-serif" font-size="34" font-weight="700">AI Music</text>
  <text x="42" y="124" fill="#aeb8ad" font-family="Arial, sans-serif" font-size="20">cover unavailable</text>
</svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800",
    },
  });
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");

  if (!rawUrl) {
    return new NextResponse("Missing image URL", { status: 400 });
  }

  let imageUrl: URL;
  try {
    imageUrl = new URL(rawUrl);
  } catch {
    return new NextResponse("Invalid image URL", { status: 400 });
  }

  if (!allowedHosts.has(imageUrl.hostname)) {
    return new NextResponse("Unsupported image host", { status: 400 });
  }

  const upstream = await fetch(imageUrl, {
    headers: {
      referer: "https://www.bilibili.com/",
      "user-agent": "Mozilla/5.0 AI-Music-Hub/0.1"
    },
    next: { revalidate: 60 * 60 * 24 * 7 }
  });

  if (!upstream.ok || !upstream.body) {
    return fallbackCover();
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "content-type": upstream.headers.get("content-type") || "image/jpeg",
      "cache-control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800"
    }
  });
}
