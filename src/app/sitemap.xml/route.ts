// app/sitemap.xml/route.ts
import { NextResponse } from "next/server";

// Escape characters for XML safety
function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
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

// Convert title to a safe slug
function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // remove non-word except dash
    .replace(/\s+/g, "-")
    .trim();
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://otakustream.xyz";

  const animeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/list-anime?page=1&per_page=500`, {
    headers: { accept: "application/json" },
  });

  if (!animeRes.ok) {
    return new NextResponse("Failed to fetch anime data", { status: 500 });
  }

  const data = await animeRes.json();
  const animeList = data.data;

  const animeUrls = animeList.map((anime: any) => {
    const slug = `${toSlug(anime.title || "unknown")}-${anime.id}`; // <-- Tambah ID
    const safeLoc = `${baseUrl}/anime/${slug}`;
    return `
      <url>
        <loc>${escapeXml(safeLoc)}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
    `;
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(baseUrl)}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${animeUrls.join("\n")}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
