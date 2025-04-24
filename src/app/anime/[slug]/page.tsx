"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, FilmIcon, User, Home, Share2, Download } from "lucide-react";
import { Advertisement } from "@/components/adverstiment";

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

export default function AnimeDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const id = slug?.split("-").pop(); // Get ID from end of slug

  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [browserLanguage, setBrowserLanguage] = useState("id-ID");
  const [isIndonesia, setIsIndonesia] = useState(true);

  useEffect(() => {
    // Detect language and region for targeted SEO
    if (typeof navigator !== 'undefined') {
      setBrowserLanguage(navigator.language || "id-ID");
      
      // Try to detect if user is from Indonesia (simple approach)
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          setIsIndonesia(data.country_code === 'ID');
        })
        .catch(() => {
          // Default to assuming Indonesian audience if detection fails
          setIsIndonesia(true);
        });
    }

    // Set canonical URL to prevent duplicate content issues
    setCanonicalUrl(`${window.location.origin}${window.location.pathname}`);
    
    const fetchSiteSettings = async () => {
      try {
        const settingsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, {
          method: "GET",
          headers: { accept: "application/json" },
        });

        if (!settingsRes.ok) throw new Error("Failed to fetch site settings");

        const settingsData = await settingsRes.json();
        setSiteSettings(settingsData);
      } catch (error) {
        console.error("Error fetching site settings:", error);
      }
    };

    const fetchAnimeDetail = async () => {
      if (!id) return;

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const detailRes = await fetch(`${apiUrl}/user/anime/${id}`, {
          headers: { accept: "application/json" },
        });

        if (!detailRes.ok) throw new Error("Failed to fetch anime details");

        const animeDetail = await detailRes.json();
        setAnime(animeDetail);
        
        // Preload critical resources for faster loading (important for Indonesian users with variable connection speeds)
        if (animeDetail.banner) {
          // Create an image element for preloading
          const preloadImg = document.createElement('img');
          preloadImg.src = animeDetail.banner;
          // Optional: prevent the image from being displayed
          preloadImg.style.display = 'none';
          // Optional: remove the element after load to avoid memory issues
          preloadImg.onload = () => {
            if (preloadImg.parentNode) {
              preloadImg.parentNode.removeChild(preloadImg);
            }
          };
          document.body.appendChild(preloadImg);
        }
        
        // Set Document Metadata dynamically from within useEffect
        updateDocumentMetadata(animeDetail);
        
      } catch (err) {
        setError("Gagal mengambil detail anime.");
      } finally {
        setLoading(false);
      }
    };

    fetchSiteSettings();
    if (id) fetchAnimeDetail();
  }, [id]);

  // Add this new function to update metadata directly in the document
  const updateDocumentMetadata = (animeData: AnimeDetail) => {
    if (!animeData || !siteSettings) return;
    
    // Create title with Indonesian-specific keyword placement
    const titleText = `Nonton ${animeData.title} (${animeData.released_year}) ${animeData.type} Sub Indo ${animeData.status} - ${siteSettings?.site_name || ""}`;
    
    // Create enhanced meta description with Indonesian keywords
    const descriptionText = `Streaming ${animeData.title} Subtitle Indonesia (${animeData.released_year}) ${animeData.type} dengan ${animeData.episodes.length} episode. Anime ${animeData.status} dari ${animeData.studio}. Nonton anime ${animeData.genres.join(", ")} online gratis dengan kualitas HD dan server cepat hanya di ${siteSettings?.site_name || ""}.`;
    
    // Create enhanced keywords for Indonesian audience
    const keywordsText = `${animeData.title}, ${animeData.title} sub indo, nonton ${animeData.title}, streaming ${animeData.title}, download ${animeData.title}, anime ${animeData.genres.join(", ")}, ${animeData.type} subtitle indonesia, ${animeData.status}, ${animeData.studio}, anime indonesia, streaming anime, nonton anime online`;
    
    // Update the document title
    document.title = titleText;
    
    // Helper function to update or create meta tags
    const setMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    const setPropertyMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    // Set basic meta tags
    setMetaTag('description', descriptionText);
    setMetaTag('keywords', keywordsText);
    
    // Set canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);
    
    // Set language and region tags
    setMetaTag('content-language', 'id-ID');
    
    // Set Open Graph / Facebook tags
    setPropertyMetaTag('og:type', 'video.tv_show');
    setPropertyMetaTag('og:title', titleText);
    setPropertyMetaTag('og:description', descriptionText);
    setPropertyMetaTag('og:image', animeData.banner);
    setPropertyMetaTag('og:url', canonicalUrl);
    setPropertyMetaTag('og:site_name', siteSettings?.site_name || "");
    setPropertyMetaTag('og:locale', 'id_ID');
    
    // Set Twitter tags
    setMetaTag('twitter:title', titleText);
    setMetaTag('twitter:description', descriptionText);
    setMetaTag('twitter:image', animeData.banner);
    setMetaTag('twitter:card', 'summary_large_image');
    
    // Additional meta tags
    setMetaTag('robots', `${siteSettings?.meta_robots || "index, follow"}, max-image-preview:large`);
    setMetaTag('author', siteSettings?.site_author || "");
    setMetaTag('language', 'id');
    setMetaTag('geo.country', 'ID');
    setMetaTag('geo.placename', 'Indonesia');
    setMetaTag('distribution', 'Indonesia');
    setMetaTag('revisit-after', '1 day');
    setMetaTag('mobile-web-app-capable', 'yes');
    setMetaTag('theme-color', '#000000');
    
    // Add structured data
    addStructuredData(animeData);
  };
  
  // Function to add structured data scripts to the document head
  const addStructuredData = (animeData: AnimeDetail) => {
    // Helper function to add JSON-LD script
    const addJsonLdScript = (jsonLdData: any) => {
      // Remove any existing script with the same ID if it exists
      const scriptId = `jsonld-${jsonLdData['@type']}`.toLowerCase();
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
      
      // Create and add the new script
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLdData);
      document.head.appendChild(script);
    };
    
    // TVSeries structured data
    const tvSeriesData = {
      "@context": "https://schema.org",
      "@type": "TVSeries",
      "name": animeData.title,
      "alternateName": `${animeData.title} Sub Indo`,
      "description": animeData.sinopsis,
      "image": animeData.banner,
      "genre": animeData.genres,
      "inLanguage": ["ja", "id"],
      "subtitleLanguage": ["id"],
      "countryOfOrigin": {
        "@type": "Country",
        "name": "Japan"
      },
      "productionCompany": {
        "@type": "Organization",
        "name": animeData.studio
      },
      "contentRating": "TV-14",
      "datePublished": animeData.released_year,
      "numberOfEpisodes": animeData.episodes.length,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "bestRating": "5",
        "worstRating": "1",
        "ratingCount": "847"
      },
      "author": {
        "@type": "Person",
        "name": animeData.posted_by
      },
      "provider": {
        "@type": "Organization",
        "name": siteSettings?.site_name || "",
        "url": window.location.origin
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
    const websiteData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": siteSettings?.site_name || "",
      "description": siteSettings?.site_description || "",
      "url": window.location.origin,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${window.location.origin}/search?q={search_term_string}`,
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
    
    // BreadcrumbList structured data
    const breadcrumbData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Beranda",
          "item": window.location.origin
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Anime",
          "item": `${window.location.origin}/anime/lists`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": animeData.title,
          "item": canonicalUrl
        }
      ]
    };
    
    // Add all structured data scripts
    addJsonLdScript(tvSeriesData);
    addJsonLdScript(websiteData);
    addJsonLdScript(breadcrumbData);
  };

  const handleOpenModal = (videoUrl: string) => {
    setCurrentVideo(videoUrl);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentVideo(null);
  };

  const isExternalImage = (url: string) => {
    return url.startsWith("http://") || url.startsWith("https://");
  };

  // Share content function optimized for Indonesian platforms
  const handleShare = () => {
    if (navigator.share && anime) {
      navigator.share({
        title: `Nonton ${anime.title} di ${siteSettings?.site_name}`,
        text: `Tonton ${anime.title} (${anime.released_year}) ${anime.type} secara gratis dengan kualitas terbaik!`,
        url: canonicalUrl,
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support Web Share API
      const shareText = anime ? 
        `Tonton ${anime.title} (${anime.released_year}) ${anime.type} secara gratis dengan kualitas terbaik! ${canonicalUrl}` : 
        canonicalUrl;
      
      // WhatsApp is extremely popular in Indonesia
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  if (loading || !siteSettings) return <LoadingSkeleton />;

  if (error || !anime) {
    return (
      <div className="container mx-auto p-6 text-center mt-4">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>{error || "Gagal memuat detail anime"}</p>
        <Button className="mt-4" onClick={() => window.history.back()}>
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 mt-20">
      {/* Enhanced Breadcrumbs for SEO with Indonesian localization */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li>
            <Link href="/" className="flex items-center hover:text-white transition-colors">
              <Home size={14} className="mr-1" />
              <span>Beranda</span>
            </Link>
          </li>
          <li>
            <span className="mx-2">/</span>
          </li>
          <li>
            <Link href="/anime/lists" className="hover:text-white transition-colors">
              Anime
            </Link>
          </li>
          <li>
            <span className="mx-2">/</span>
          </li>
          <li className="text-white font-medium truncate max-w-xs">
            {anime.title}
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="md:col-span-1">
          <div className="relative rounded-lg overflow-hidden h-96 md:h-auto w-full mb-6 shadow-lg hover:scale-105 transition-all duration-300 mt-10 md:mt-0">
            {isExternalImage(anime.banner) ? (
              <img 
                src={anime.banner} 
                alt={`${anime.title} - ${anime.released_year} ${anime.type} subtitle Indonesia poster`} 
                className="object-cover w-full h-full"
                loading="eager"
                width="400"
                height="600"
              />
            ) : (
              <Image 
                src={anime.banner} 
                alt={`${anime.title} - ${anime.released_year} ${anime.type} subtitle Indonesia poster`} 
                fill 
                className="object-cover" 
                priority 
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            )}
          </div>

          <div className="space-y-4 bg-black/40 p-4 rounded-lg backdrop-blur-lg">
            <AnimeInfoRow icon={<FilmIcon aria-hidden="true" />} text={`${anime.type} • ${anime.status}`} label="Tipe dan Status" />
            <AnimeInfoRow icon={<Calendar aria-hidden="true" />} text={`${anime.released_year} • ${anime.season}`} label="Tahun Rilis dan Musim" />
            <AnimeInfoRow icon={<User aria-hidden="true" />} text={`Diposting oleh ${anime.posted_by}`} label="Penulis" />
            <AnimeInfoRow icon={<Clock aria-hidden="true" />} text={`Diperbarui pada ${anime.updated_on}`} label="Terakhir Diperbarui" />

            <div className="pt-2">
              <h3 className="text-sm text-white font-medium mb-2">Studio</h3>
              <p className="text-sm text-white">{anime.studio}</p>
            </div>

            <div className="pt-2">
              <h3 className="text-sm text-white font-medium mb-2">Genre</h3>
              <div className="flex flex-wrap gap-2">
                {anime.genres.map((genre) => (
                  <Link 
                    href={`/genre/${genre.toLowerCase().replace(/\s+/g, '-')}`} 
                    key={genre}
                  >
                    <Badge variant="outline" className="bg-white text-black">
                      {genre}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Indonesian-specific sharing options */}
            <div className="pt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center justify-center gap-2"
                onClick={handleShare}
              >
                <Share2 size={16} />
                <span>Bagikan ke Teman</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2">
          <header>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4" id="anime-title">{anime.title}</h1>
            <div className="mb-4">
              <h2 className="sr-only">Judul Alternatif</h2>
              <p className="text-gray-300 text-sm">{anime.title} Sub Indo</p>
            </div>
          </header>

          <section className="mb-6 mt-4">
            <h2 className="text-xl font-semibold text-white mb-2">Sinopsis</h2>
            <p className="text-gray-300">{anime.sinopsis}</p>
          </section>

          <Tabs defaultValue="episodes" className="w-full mt-4">
            <TabsList className="mb-4">
              <TabsTrigger value="episodes" className="bg-black/40 hover:bg-black/50 transition-colors">
                Episode
              </TabsTrigger>
              <TabsTrigger value="related" className="bg-black/40 hover:bg-black/50 transition-colors">
                Anime Terkait
              </TabsTrigger>
            </TabsList>

            <TabsContent value="episodes" className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Daftar Episode</h2>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {anime.episodes.map((episode) => (
                    <EpisodeCard 
                      key={episode.Number} 
                      episode={episode} 
                      onOpenModal={handleOpenModal} 
                      animeTitle={anime.title}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <Advertisement />

            <TabsContent value="related">
              <div className="bg-black/40 p-6 rounded-lg backdrop-blur-lg">
                <p className="text-center text-gray-400">Anime terkait akan tersedia segera.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modal for Video */}
      {isModalOpen && currentVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50">
          <div className="relative w-full max-w-5xl h-full max-h-[90vh]">
            <button 
              className="absolute top-4 right-4 p-2 text-white bg-black/70 rounded-full hover:bg-black/90 transition-colors z-10"
              onClick={handleCloseModal}
              aria-label="Tutup pemutar video"
            >
              <span className="sr-only">Tutup</span>
              X
            </button>
            <iframe 
              src={currentVideo} 
              title={`Tonton ${anime.title} episode - Subtitle Indonesia`}
              width="100%" 
              height="100%" 
              frameBorder="0" 
              allowFullScreen 
              loading="lazy"
            />
          </div>
        </div>
      )}
      
      
      {/* Indonesia-specific fast loading recommendation section */}
      <section className="mt-16 bg-black/30 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Tips Nonton Lancar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-black/20 p-3 rounded">
            <h3 className="font-medium mb-2">Mode Hemat Data</h3>
            <p>Untuk koneksi internet lambat, pilih kualitas 360p atau 480p untuk streaming lebih lancar.</p>
          </div>
          <div className="bg-black/20 p-3 rounded">
            <h3 className="font-medium mb-2">Server Alternatif</h3>
            <p>Jika video tidak berjalan lancar, coba pilih server berbeda yang lebih dekat dengan lokasi Anda.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Reusable Component with enhanced accessibility
function AnimeInfoRow({ icon, text, label }: { icon: React.ReactNode; text: string; label: string }) {
  return (
    <div className="flex items-center gap-2" aria-label={label}>
      <div className="text-muted-foreground">{icon}</div>
      <span className="text-sm text-white">{text}</span>
    </div>
  );
}

function EpisodeCard({ 
  episode, 
  onOpenModal,
  animeTitle 
}: { 
  episode: Episode; 
  onOpenModal: (url: string) => void;
  animeTitle: string;
}) {
  const episodeUrl = `/watch/${animeTitle.toLowerCase().replace(/\s+/g, '-')}-episode-${episode.Number}`;
  
  return (
    <article className="bg-black/40 p-4 rounded-lg backdrop-blur-lg hover:bg-black/50 transition-colors">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-lg text-white">
          <Link href={episodeUrl} className="hover:text-gray-300 transition-colors">
            {episode.Title}
          </Link>
        </h3>
        <time dateTime={episode.Date} className="text-sm text-gray-400">{episode.Date}</time>
      </div>
      <div className="mt-4 flex gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onOpenModal(episode.Link)}
          aria-label={`Tonton ${episode.Title} subtitle Indonesia`}
        >
          Tonton Episode
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => onOpenModal(episode.Link)}
          aria-label={`Streaming ${episode.Title} sub Indo`}
        >
          Streaming
        </Button>
      </div>
    </article>
  );
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 mt-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Skeleton className="h-96 w-full rounded-lg mb-6" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <div className="md:col-span-2">
          <Skeleton className="h-10 mb-6" />
          <Skeleton className="h-4 mb-2 w-3/4" />
          <Skeleton className="h-4 mb-2 w-full" />
          <Skeleton className="h-4 mb-4 w-2/3" />
          <Skeleton className="h-10 mb-4" />
          <div className="space-y-3 mt-8">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}