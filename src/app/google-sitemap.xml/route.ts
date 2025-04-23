// app/sitemap.xml/route.ts
import { NextResponse } from "next/server";

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://otakustream.xyz";

    const animeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/list-anime?page=1&per_page=500`, {
      headers: { accept: "application/json" },
    });

    if (!animeRes.ok) {
      return new NextResponse("Failed to fetch anime data", { status: 500 });
    }

    const data = await animeRes.json();
    const animeList = data.data;

    const today = new Date().toISOString().split("T")[0]; // format YYYY-MM-DD

    const animeUrls = animeList.map((anime: any) => {
      const slug = `${toSlug(anime.title || "unknown")}-${anime.id}`;
      const url = `${baseUrl}/anime/${slug}`;
      return `
  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${today}</lastmod>
  </url>`;
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(baseUrl)}/</loc>
    <lastmod>${today}</lastmod>
  </url>
  ${animeUrls.join("\n")}
</urlset>`;

    return new NextResponse(sitemap.trim(), {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
