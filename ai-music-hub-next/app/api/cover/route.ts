import { NextRequest, NextResponse } from "next/server";

const allowedHosts = new Set(["i0.hdslb.com", "i1.hdslb.com", "i2.hdslb.com", "i3.hdslb.com", "i4.hdslb.com"]);

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
    return new NextResponse("Image unavailable", { status: 502 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "content-type": upstream.headers.get("content-type") || "image/jpeg",
      "cache-control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800"
    }
  });
}
