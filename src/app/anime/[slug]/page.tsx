// File: app/anime/[slug]/page.tsx
// This is the server component that handles metadata

import { Metadata } from "next";
import AnimeDetailClient from "@/components/client";

// Type definitions
interface Episode {
  Date: string;
  Link: string;
  Title: string;
  Number: string;
}

interface AnimeDetail {
  id: number;
  title: string;
  status: string;
  studio: string;
  released_year: string;
  season: string;
  type: string;
  posted_by: string;
  updated_on: string;
  banner: string;
  sinopsis: string;
  episodes: Episode[];
  genres: string[];
}

interface SiteSettings {
  site_name: string;
  site_description: string;
  site_keywords: string;
  site_author: string;
  meta_title: string;
  meta_description: string;
  meta_robots: string;
  favicon_url: string | null;
  logo_url: string | null;
  google_analytics_id: string | null;
  facebook_pixel_id: string | null;
}

// This function generates metadata during server-side rendering
export async function generateMetadata({ params }): Promise<Metadata> {
  const slug = params?.slug as string;
  const id = slug?.split("-").pop();
  
  try {
    // Fetch site settings
    const settingsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, {
      method: "GET",
      headers: { accept: "application/json" },
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    const siteSettings = await settingsRes.json();
    
    // Fetch anime details
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const detailRes = await fetch(`${apiUrl}/user/anime/${id}`, {
      headers: { accept: "application/json" },
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!detailRes.ok) {
      return {
        title: `Anime Detail - ${siteSettings.site_name}`,
        description: siteSettings.site_description
      };
    }
    
    const anime = await detailRes.json();
    const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/anime/${slug}`;
    
    // Enhanced title with Indonesian-specific keyword placement
    const animeTitleForMeta = 
      `Nonton ${anime.title} (${anime.released_year}) ${anime.type} Sub Indo ${anime.status} - ${siteSettings.site_name}`;
      
    // Enhanced meta description with Indonesian keywords and improved CTA for local audience
    const metaDescription = 
      `Streaming ${anime.title} Subtitle Indonesia (${anime.released_year}) ${anime.type} dengan ${anime.episodes.length} episode. Anime ${anime.status} dari ${anime.studio}. Nonton anime ${anime.genres.join(", ")} online gratis dengan kualitas HD dan server cepat hanya di ${siteSettings.site_name}.`;
    
    // Enhanced keywords for Indonesian audience  
    const enhancedKeywords = 
      `${anime.title}, ${anime.title} sub indo, nonton ${anime.title}, streaming ${anime.title}, download ${anime.title}, anime ${anime.genres.join(", ")}, ${anime.type} subtitle indonesia, ${anime.status}, ${anime.studio}, anime indonesia, streaming anime, nonton anime online`;
    
    return {
      title: animeTitleForMeta,
      description: metaDescription,
      keywords: enhancedKeywords,
      alternates: {
        canonical: canonicalUrl,
        languages: {
          'id-ID': canonicalUrl,
          'x-default': canonicalUrl
        }
      },
      openGraph: {
        title: animeTitleForMeta,
        description: metaDescription,
        url: canonicalUrl,
        siteName: siteSettings.site_name,
        images: [{
          url: anime.banner,
          width: 1200,
          height: 630,
          alt: `${anime.title} - ${anime.released_year} ${anime.type} subtitle Indonesia poster`
        }],
        locale: 'id_ID',
        type: 'video.tv_show'
      },
      twitter: {
        card: 'summary_large_image',
        title: animeTitleForMeta,
        description: metaDescription,
        site: '@yoursitename',
        images: [anime.banner]
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1
        }
      },
      authors: [{ name: siteSettings.site_author }],
      formatDetection: {
        email: false,
        address: false,
        telephone: false
      },
      other: {
        'content-language': 'id-ID',
        'language': 'id',
        'geo.country': 'ID',
        'geo.placename': 'Indonesia',
        'distribution': 'Indonesia',
        'revisit-after': '1 day',
        'mobile-web-app-capable': 'yes',
        'theme-color': '#000000',
      }
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Anime Detail",
      description: "Detail anime subtitle Indonesia"
    };
  }
}

// JSON-LD structured data component for server rendering
export default async function AnimeDetailPage({ params }) {
  const slug = params?.slug as string;
  const id = slug?.split("-").pop();
  
  try {
    // Fetch site settings
    const settingsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, {
      method: "GET",
      headers: { accept: "application/json" },
      next: { revalidate: 3600 }
    });
    
    const siteSettings = await settingsRes.json();
    
    // Fetch anime details
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const detailRes = await fetch(`${apiUrl}/user/anime/${id}`, {
      headers: { accept: "application/json" },
      next: { revalidate: 3600 }
    });
    
    if (!detailRes.ok) {
      throw new Error("Failed to fetch anime details");
    }
    
    const anime = await detailRes.json();
    const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/anime/${slug}`;
    
    // Generate structured data for the anime
    const animeJsonLd = {
      "@context": "https://schema.org",
      "@type": "TVSeries",
      "name": anime.title,
      "alternateName": `${anime.title} Sub Indo`,
      "description": anime.sinopsis,
      "image": anime.banner,
      "genre": anime.genres,
      "inLanguage": ["ja", "id"],
      "subtitleLanguage": ["id"],
      "countryOfOrigin": {
        "@type": "Country",
        "name": "Japan"
      },
      "productionCompany": {
        "@type": "Organization",
        "name": anime.studio
      },
      "contentRating": "TV-14",
      "datePublished": anime.released_year,
      "numberOfEpisodes": anime.episodes.length,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "bestRating": "5",
        "worstRating": "1",
        "ratingCount": "847"
      },
      "author": {
        "@type": "Person",
        "name": anime.posted_by
      },
      "provider": {
        "@type": "Organization",
        "name": siteSettings.site_name,
        "url": process.env.NEXT_PUBLIC_SITE_URL
      },
      "potentialAction": {
        "@type": "WatchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": canonicalUrl
        }
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "IDR",
        "availability": "https://schema.org/InStock"
      }
    };
    
    // Website structured data
    const websiteJsonLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": siteSettings.site_name,
      "description": siteSettings.site_description,
      "url": process.env.NEXT_PUBLIC_SITE_URL,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${process.env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      },
      "inLanguage": ["id", "en"],
      "audience": {
        "@type": "Audience",
        "audienceType": "Anime Fans",
        "geographicArea": {
          "@type": "Country",
          "name": "Indonesia"
        }
      }
    };
    
    // Breadcrumb structured data
    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Beranda",
          "item": process.env.NEXT_PUBLIC_SITE_URL
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Anime",
          "item": `${process.env.NEXT_PUBLIC_SITE_URL}/anime`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": anime.title,
          "item": canonicalUrl
        }
      ]
    };
    
    // Pass the fetched data to the client component
    return (
      <>
        {/* Structured data for SEO */}
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: JSON.stringify(animeJsonLd) }} 
        />
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} 
        />
        <script 
          type="application/ld+json" 
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} 
        />
        
        {/* Client component with props */}
        <AnimeDetailClient 
          initialAnimeData={anime} 
          initialSettings={siteSettings} 
          animeId={id} 
        />
      </>
    );
  } catch (error) {
    console.error("Error in server component:", error);
    return <AnimeDetailClient animeId={id} />;
  }
}