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

interface AnimeData {
  id: number;
  title: string;
  status: string;
  banner: string;
  genres: string[];
  released_year: string;
}

interface ApiResponse {
  page: number;
  per_page: number;
  total: number;
  data: AnimeData[];
}

async function fetchAllAnime(): Promise<AnimeData[]> {
  const baseApiUrl = process.env.NEXT_PUBLIC_API_URL;
  const perPage = 500; // Max items per page
  let allAnime: AnimeData[] = [];
  let totalAnime = 0;
  
  try {
    if (!baseApiUrl) {
      console.log("API URL not available during build - returning empty anime list");
      return [];
    }
    
    // First request to get total count
    const initialRes = await fetch(`${baseApiUrl}/user/list-anime?page=1&per_page=${perPage}`, {
      headers: { accept: "application/json" },
    });
    
    if (!initialRes.ok) {
      console.log("API not available during build - returning empty anime list");
      return [];
    }
    
    const initialData: ApiResponse = await initialRes.json();
    totalAnime = initialData.total;
    allAnime = [...initialData.data];
    
    // Calculate total pages needed
    const totalPages = Math.ceil(totalAnime / perPage);
    
    // Fetch remaining pages
    const remainingRequests = [];
    for (let i = 2; i <= totalPages; i++) {
      remainingRequests.push(
        fetch(`${baseApiUrl}/user/list-anime?page=${i}&per_page=${perPage}`, {
          headers: { accept: "application/json" },
        }).then(res => {
          if (!res.ok) throw new Error(`Failed to fetch page ${i}`);
          return res.json();
        }).then((data: ApiResponse) => data.data)
      );
    }
    
    // Wait for all requests to complete
    if (remainingRequests.length > 0) {
      const remainingData = await Promise.all(remainingRequests);
      remainingData.forEach(pageData => {
        allAnime = [...allAnime, ...pageData];
      });
    }
    
    return allAnime;
  } catch (error) {
    console.log("Error fetching anime for sitemap during build - returning empty list");
    return [];
  }
}

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://otakustream.xyz";
    const animeList = await fetchAllAnime();
    
    console.log(`Generated sitemap with ${animeList.length} anime entries`);
    
    const today = new Date().toISOString().split("T")[0]; // format YYYY-MM-DD
    
    // Generate static URLs
    const staticUrls = [
      `${baseUrl}/`,
      `${baseUrl}/anime`,
      `${baseUrl}/schedule`,
      `${baseUrl}/about`,
      `${baseUrl}/contact`,
    ].map(url => `
  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${today}</lastmod>
  </url>`);
    
    // Generate anime URLs
    const animeUrls = animeList.map((anime: AnimeData) => {
      const slug = `${toSlug(anime.title || "unknown")}-${anime.id}`;
      const url = `${baseUrl}/anime/${slug}`;
      return `
  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${today}</lastmod>
  </url>`;
    });
    
    // Add genre pages if your site has them
    const allGenres = new Set<string>();
    animeList.forEach((anime: AnimeData) => {
      if (anime.genres && Array.isArray(anime.genres)) {
        anime.genres.forEach((genre: string) => allGenres.add(genre));
      }
    });
    
    const genreUrls = Array.from(allGenres).map(genre => {
      const genreSlug = toSlug(genre);
      const url = `${baseUrl}/genre/${genreSlug}`;
      return `
  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${today}</lastmod>
  </url>`;
    });
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticUrls.join("\n")}
  ${genreUrls.join("\n")}
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