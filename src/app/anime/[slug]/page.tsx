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
import { Calendar, Clock, FilmIcon, User, Home, Share2, Download, X, Maximize, Minimize, Volume2, VolumeX } from "lucide-react";
import {Advertisement} from "@/components/adverstiment"
import Head from "next/head";

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
  const [currentEpisodeTitle, setCurrentEpisodeTitle] = useState("");
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
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
    if (typeof window !== 'undefined') {
      setCanonicalUrl(`${window.location.origin}${window.location.pathname}`);
    }
    
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
        
        // Preload critical resources for faster loading
        if (animeDetail.banner) {
          const preloadImg = document.createElement('img');
          preloadImg.src = animeDetail.banner;
          preloadImg.style.display = 'none';
          preloadImg.onload = () => {
            if (preloadImg.parentNode) {
              preloadImg.parentNode.removeChild(preloadImg);
            }
          };
          document.body.appendChild(preloadImg);
        }
      } catch (err) {
        setError("Gagal mengambil detail anime.");
      } finally {
        setLoading(false);
      }
    };

    fetchSiteSettings();
    if (id) fetchAnimeDetail();
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
      if (e.key === 'f' && isModalOpen) {
        toggleFullscreen();
      }
      if (e.key === 'm' && isModalOpen) {
        toggleMute();
      }
    };

    const handlePopState = () => {
      if (isModalOpen) {
        handleCloseModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isModalOpen]);

  const handleOpenModal = (videoUrl: string, episodeTitle: string) => {
    setCurrentVideo(videoUrl);
    setCurrentEpisodeTitle(episodeTitle);
    setIsModalOpen(true);
    setIsIframeLoading(true);
    document.body.style.overflow = 'hidden';
    
    // Add to browser history
    window.history.pushState({ modalOpen: true }, '', '#watch');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentVideo(null);
    setCurrentEpisodeTitle("");
    document.body.style.overflow = 'auto';
    
    // Restore the URL
    if (window.location.hash === '#watch') {
      window.history.back();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const isExternalImage = (url: string) => {
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const handleShare = () => {
    if (navigator.share && anime) {
      navigator.share({
        title: `Nonton ${anime.title} di ${siteSettings?.site_name}`,
        text: `Tonton ${anime.title} (${anime.released_year}) ${anime.type} secara gratis dengan kualitas terbaik!`,
        url: canonicalUrl,
      }).catch(console.error);
    } else {
      const shareText = anime ? 
        `Tonton ${anime.title} (${anime.released_year}) ${anime.type} secara gratis dengan kualitas terbaik! ${canonicalUrl}` : 
        canonicalUrl;
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  const animeTitleForMeta = anime ? 
    `Nonton ${anime.title} (${anime.released_year}) ${anime.type} Sub Indo ${anime.status} - ${siteSettings?.site_name}` : 
    siteSettings?.meta_title || "";
    
  const metaDescription = anime ? 
    `Streaming ${anime.title} Subtitle Indonesia (${anime.released_year}) ${anime.type} dengan ${anime.episodes.length} episode. Anime ${anime.status} dari ${anime.studio}. Nonton anime ${anime.genres.join(", ")} online gratis dengan kualitas HD dan server cepat hanya di ${siteSettings?.site_name}.` : 
    siteSettings?.meta_description || "";

  const enhancedKeywords = anime ? 
    `${anime.title}, ${anime.title} sub indo, nonton ${anime.title}, streaming ${anime.title}, download ${anime.title}, anime ${anime.genres.join(", ")}, ${anime.type} subtitle indonesia, ${anime.status}, ${anime.studio}, anime indonesia, streaming anime, nonton anime online` : 
    "";

  const generateJsonLd = () => {
    if (!anime || !siteSettings) return "";

    const jsonLd = {
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
        "url": typeof window !== 'undefined' ? window.location.origin : ""
      },
      "potentialAction": {
        "@type": "WatchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${canonicalUrl}`
        }
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "IDR",
        "availability": "https://schema.org/InStock"
      }
    };

    return JSON.stringify(jsonLd);
  };

  const generateWebsiteJsonLd = () => {
    if (!siteSettings) return "";

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": siteSettings.site_name,
      "description": siteSettings.site_description,
      "url": typeof window !== 'undefined' ? window.location.origin : "",
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${typeof window !== 'undefined' ? window.location.origin : ""}/search?q={search_term_string}`,
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

    return JSON.stringify(jsonLd);
  };

  const generateBreadcrumbJsonLd = () => {
    if (!anime) return "";

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Beranda",
          "item": typeof window !== 'undefined' ? window.location.origin : ""
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Anime",
          "item": `${typeof window !== 'undefined' ? window.location.origin : ""}/anime`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": anime.title,
          "item": canonicalUrl
        }
      ]
    };

    return JSON.stringify(jsonLd);
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
    <>
      <Head>
        <title>{animeTitleForMeta}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={enhancedKeywords} />
        <link rel="canonical" href={canonicalUrl} />
        
        <meta httpEquiv="content-language" content="id-ID" />
        <link rel="alternate" href={canonicalUrl} hrefLang="id-ID" />
        <link rel="alternate" href={canonicalUrl} hrefLang="x-default" />
        
        <meta property="og:type" content="video.tv_show" />
        <meta property="og:title" content={animeTitleForMeta} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={anime.banner} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content={siteSettings.site_name} />
        <meta property="og:locale" content="id_ID" />
        
        <meta name="twitter:title" content={animeTitleForMeta} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={anime.banner} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@yoursitename" />
        
        <meta name="robots" content={`${siteSettings.meta_robots || "index, follow"}, max-image-preview:large`} />
        <meta name="author" content={siteSettings.site_author} />
        <meta name="language" content="id" />
        <meta name="geo.country" content="ID" />
        <meta name="geo.placename" content="Indonesia" />
        <meta name="distribution" content="Indonesia" />
        <meta name="revisit-after" content="1 day" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000" />
        
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: generateJsonLd() }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: generateWebsiteJsonLd() }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: generateBreadcrumbJsonLd() }} />
      </Head>

      <div className="container mx-auto py-6 px-4 md:px-6 mt-20">
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

              <TabsContent value="related">
                <div className="bg-black/40 p-6 rounded-lg backdrop-blur-lg">
                  <p className="text-center text-gray-400">Anime terkait akan tersedia segera.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <Advertisement />
        {/* Netflix-style Video Modal */}
        {isModalOpen && currentVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50">
            <div className={`relative ${isFullscreen ? 'w-full h-full' : 'w-full max-w-5xl h-full max-h-[90vh]'} rounded-lg overflow-hidden`}>
              {isIframeLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
              
              <button 
                className="absolute top-4 right-4 p-2 text-white bg-black/70 rounded-full hover:bg-black/90 transition-colors z-10"
                onClick={handleCloseModal}
                aria-label="Tutup pemutar video"
              >
                <X size={24} />
              </button>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button 
                      className="text-white hover:text-gray-300 transition-colors"
                      onClick={toggleFullscreen}
                      aria-label="Toggle fullscreen"
                    >
                      {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                    <button 
                      className="text-white hover:text-gray-300 transition-colors"
                      onClick={toggleMute}
                      aria-label="Toggle mute"
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                  </div>
                  <div className="text-white text-sm">
                    {anime.title} - {currentEpisodeTitle}
                  </div>
                </div>
              </div>
              
              <iframe 
                src={currentVideo} 
                title={`Tonton ${anime.title} - Subtitle Indonesia`}
                width="100%" 
                height="100%" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                onLoad={() => setIsIframeLoading(false)}
              />
            </div>
          </div>
        )}
        <Advertisement />
        <Advertisement />
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
    </>
  );
}

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
  onOpenModal: (url: string, title: string) => void;
  animeTitle: string;
}) {
  // Generate a URL for the episode (used for navigation history)
  const episodeUrl = `/watch/${animeTitle.toLowerCase().replace(/\s+/g, '-')}-episode-${episode.Number}`;
  
  // Function to handle title click - now opens modal instead of navigating
  const handleTitleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default navigation behavior
    onOpenModal(episode.Link, episode.Title);
  };
  
  return (
    <article className="bg-black/40 p-4 rounded-lg backdrop-blur-lg hover:bg-black/50 transition-colors">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-lg text-white">
          {/* Modified Link to use onClick instead of href navigation */}
          <a 
            href={episodeUrl} 
            onClick={handleTitleClick}
            className="hover:text-gray-300 transition-colors cursor-pointer"
          >
            {episode.Title}
          </a>
        </h3>
        <time dateTime={episode.Date} className="text-sm text-gray-400">{episode.Date}</time>
      </div>
      <div className="mt-4 flex gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onOpenModal(episode.Link, episode.Title)}
          aria-label={`Tonton ${episode.Title} subtitle Indonesia`}
        >
          Tonton Episode
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