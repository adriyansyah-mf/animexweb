// app/sitemap.xml/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com"; // ← Change to your real domain

  const animeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/list-anime?page=1&per_page=500`, {
    headers: { accept: "application/json" },
  });

  if (!animeRes.ok) {
    return new NextResponse("Failed to fetch anime data", { status: 500 });
  }

  const data = await animeRes.json();
  const animeList = data.data;

  const toSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");

  const animeUrls = animeList.map((anime: any) => {
    const slug = toSlug(anime.title);
    return `
      <url>
        <loc>${baseUrl}/anime/${slug}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
    `;
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${baseUrl}/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      ${animeUrls.join("")}
    </urlset>
  `;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
