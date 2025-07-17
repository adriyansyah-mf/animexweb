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

// Format date in RFC 822/1123 format as required by RSS spec and Google
function formatRFC822Date(date: Date): string {
  return date.toUTCString();
}

interface AnimeData {
  id: number;
  title: string;
  status: string;
  banner: string;
  genres: string[];
  released_year: string;
  synopsis?: string;
  updated_at?: string;
}

interface ApiResponse {
  page: number;
  per_page: number;
  total: number;
  data: AnimeData[];
}

async function fetchRecentAnime(limit: number = 100): Promise<AnimeData[]> {
  const baseApiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  try {
    if (!baseApiUrl) {
      console.log("API URL not available during build - returning empty RSS");
      return [];
    }
    
    // Fetch recent anime with sorting by latest updated
    const res = await fetch(`${baseApiUrl}/user/list-anime?page=1&per_page=${limit}&sort=updated_at&order=desc`, {
      headers: { accept: "application/json" },
    });
    
    if (!res.ok) {
      console.log("API not available during build - returning empty RSS");
      return [];
    }
    
    const data: ApiResponse = await res.json();
    return data.data;
  } catch (error) {
    console.log("Error fetching anime for RSS during build - returning empty list");
    return [];
  }
}

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://otakustream.xyz";
    const recentAnime = await fetchRecentAnime(1807); // Get 100 most recent anime for Google
    
    const now = new Date();
    const nowRFC822 = formatRFC822Date(now);
    
    // Build channel information with required Google elements
    const channelInfo = `
    <title>OtakuStream - Latest Anime Updates</title>
    <description>Get the latest anime updates, releases, and information from OtakuStream</description>
    <link>${escapeXml(baseUrl)}</link>
    <language>en</language>
    <lastBuildDate>${nowRFC822}</lastBuildDate>
    <pubDate>${nowRFC822}</pubDate>
    <ttl>60</ttl>
    <image>
      <url>${escapeXml(`${baseUrl}/logo.png`)}</url>
      <title>OtakuStream</title>
      <link>${escapeXml(baseUrl)}</link>
    </image>
    <copyright>Copyright ${now.getFullYear()} OtakuStream</copyright>`;
    
    // Generate items for each anime - formatted for Google
    const items = recentAnime.map((anime: AnimeData) => {
      const slug = `${toSlug(anime.title || "unknown")}-${anime.id}`;
      const link = `${baseUrl}/anime/${slug}`;
      
      // Format date according to RFC 822 (required by Google)
      const pubDate = anime.updated_at 
        ? formatRFC822Date(new Date(anime.updated_at))
        : nowRFC822;
      
      // Create a clear, HTML-formatted description
      // Google prefers content:encoded for full HTML content
      const htmlContent = `
        <![CDATA[
          <div>
            <img src="${anime.banner}" alt="${escapeXml(anime.title)}" style="max-width:600px;display:block;margin-bottom:15px;" />
            <h3>About ${escapeXml(anime.title)}</h3>
            <p><strong>Status:</strong> ${anime.status}</p>
            <p><strong>Released:</strong> ${anime.released_year}</p>
            ${anime.genres && Array.isArray(anime.genres) ? 
              `<p><strong>Genres:</strong> ${anime.genres.join(", ")}</p>` : ''}
            ${anime.synopsis ? `<p>${escapeXml(anime.synopsis)}</p>` : 
              `<p>Explore ${escapeXml(anime.title)} on OtakuStream. Watch and learn more about this ${anime.released_year} anime.</p>`}
            <p><a href="${escapeXml(link)}">View full details on OtakuStream</a></p>
          </div>
        ]]>
      `;
      
      // Create a plain text description (Google may use this for snippets)
      const plainDescription = anime.synopsis ? 
        escapeXml(anime.synopsis.substring(0, 150) + (anime.synopsis.length > 150 ? '...' : '')) : 
        `Explore ${escapeXml(anime.title)} (${anime.released_year}) on OtakuStream. Status: ${anime.status}.`;
      
      // Categories/keywords help with Google indexing
      const categories = anime.genres && Array.isArray(anime.genres) ? 
        anime.genres.map(genre => `<category>${escapeXml(genre)}</category>`).join('\n    ') : '';
      
      return `
  <item>
    <title>${escapeXml(anime.title)}</title>
    <link>${escapeXml(link)}</link>
    <guid isPermaLink="true">${escapeXml(link)}</guid>
    <pubDate>${pubDate}</pubDate>
    <description>${plainDescription}</description>
    <content:encoded>${htmlContent}</content:encoded>
    ${categories}
    <source url="${escapeXml(`${baseUrl}/api/rss`)}">OtakuStream</source>
  </item>`;
    });
    
    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" 
    xmlns:atom="http://www.w3.org/2005/Atom"
    xmlns:content="http://purl.org/rss/1.0/modules/content/"
    xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
    ${channelInfo}
    <atom:link href="${escapeXml(`${baseUrl}/api/rss`)}" rel="self" type="application/rss+xml" />
    ${items.join("\n")}
</channel>
</rss>`;
    
    return new NextResponse(rss.trim(), {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=1800, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("RSS feed generation error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}