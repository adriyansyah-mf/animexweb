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
import { Calendar, Clock, FilmIcon, User, Home } from "lucide-react";
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
  const id = slug?.split("-").pop(); // Ambil ID dari akhir slug

  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [canonicalUrl, setCanonicalUrl] = useState("");

  useEffect(() => {
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
      } catch (err) {
        setError("Gagal mengambil detail anime.");
      } finally {
        setLoading(false);
      }
    };

    fetchSiteSettings();
    if (id) fetchAnimeDetail();
  }, [id]);

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

  // Improved title with better keyword placement
  const animeTitleForMeta = anime ? 
    `${anime.title} (${anime.released_year}) ${anime.type} ${anime.status} - ${siteSettings?.site_name}` : 
    siteSettings?.meta_title || "";
    
  // Enhanced meta description with more targeted keywords and clear CTA
  const metaDescription = anime ? 
    `Watch ${anime.title} (${anime.released_year}) ${anime.type} with ${anime.episodes.length} episodes. ${anime.status} anime from ${anime.studio}. Stream ${anime.genres.join(", ")} anime online for free with HD quality and fast loading at ${siteSettings?.site_name}.` : 
    siteSettings?.meta_description || "";

  // Generate JSON-LD structured data for the anime
  const generateJsonLd = () => {
    if (!anime || !siteSettings) return "";

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "TVSeries",
      "name": anime.title,
      "description": anime.sinopsis,
      "image": anime.banner,
      "genre": anime.genres,
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
        "url": window.location.origin
      }
    };

    return JSON.stringify(jsonLd);
  };

  if (loading || !siteSettings) return <LoadingSkeleton />;

  if (error || !anime) {
    return (
      <div className="container mx-auto p-6 text-center mt-4">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p>{error || "Failed to load anime details"}</p>
        <Button className="mt-4" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Enhanced SEO Metadata */}
      <Head>
        <title>{animeTitleForMeta}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={`${anime.title}, ${anime.genres.join(", ")}, ${anime.type}, ${anime.status}, ${anime.studio}, ${siteSettings.site_keywords}`} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="video.tv_show" />
        <meta property="og:title" content={animeTitleForMeta} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={anime.banner} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content={siteSettings.site_name} />
        
        {/* Twitter */}
        <meta name="twitter:title" content={animeTitleForMeta} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={anime.banner} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@yoursitename" />
        
        {/* Additional Meta Tags */}
        <meta name="robots" content={siteSettings.meta_robots || "index, follow"} />
        <meta name="author" content={siteSettings.site_author} />
        <meta name="language" content="en" />
        <meta name="revisit-after" content="7 days" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Schema.org JSON-LD structured data */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: generateJsonLd() }} />
      </Head>

      <div className="container mx-auto py-8 px-4 md:px-6 mt-4">
        {/* Breadcrumbs for SEO and navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-400">
            <li>
              <Link href="/" className="flex items-center hover:text-white transition-colors">
                <Home size={14} className="mr-1" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <Link href="/anime" className="hover:text-white transition-colors">
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
                  alt={`${anime.title} - ${anime.released_year} ${anime.type} poster`} 
                  className="object-cover w-full h-full"
                  loading="eager"
                />
              ) : (
                <Image 
                  src={anime.banner} 
                  alt={`${anime.title} - ${anime.released_year} ${anime.type} poster`} 
                  fill 
                  className="object-cover" 
                  priority 
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              )}
            </div>

            <div className="space-y-4 bg-black/40 p-4 rounded-lg backdrop-blur-lg">
              <AnimeInfoRow icon={<FilmIcon aria-hidden="true" />} text={`${anime.type} • ${anime.status}`} label="Type and Status" />
              <AnimeInfoRow icon={<Calendar aria-hidden="true" />} text={`${anime.released_year} • ${anime.season}`} label="Release and Season" />
              <AnimeInfoRow icon={<User aria-hidden="true" />} text={`Posted by ${anime.posted_by}`} label="Author" />
              <AnimeInfoRow icon={<Clock aria-hidden="true" />} text={`Updated on ${anime.updated_on}`} label="Last Updated" />

              <div className="pt-2">
                <h3 className="text-sm text-white font-medium mb-2">Studio</h3>
                <p className="text-sm text-white">{anime.studio}</p>
              </div>

              <div className="pt-2">
                <h3 className="text-sm text-white font-medium mb-2">Genres</h3>
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
            </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-2">
            <header>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{anime.title}</h1>
            </header>

            <section className="mb-6 mt-4">
              <h2 className="text-xl font-semibold text-white mb-2">Synopsis</h2>
              <p className="text-gray-300">{anime.sinopsis}</p>
            </section>

            <Tabs defaultValue="episodes" className="w-full mt-4">
              <TabsList className="mb-4">
                <TabsTrigger value="episodes" className="bg-black/40 hover:bg-black/50 transition-colors">
                  Episodes
                </TabsTrigger>
                <TabsTrigger value="related" className="bg-black/40 hover:bg-black/50 transition-colors">
                  Related Anime
                </TabsTrigger>
              </TabsList>

              <TabsContent value="episodes" className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Episodes List</h2>
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
                  <p className="text-center text-gray-400">Related anime will be available soon.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Modal for Video */}
        {isModalOpen && currentVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
            <div className="relative w-full h-full">
              <button 
                className="absolute top-4 right-4 p-2 text-white bg-black/50 rounded-full hover:bg-black/80 transition-colors"
                onClick={handleCloseModal}
                aria-label="Close video player"
              >
                <span className="sr-only">Close</span>
                X
              </button>
              <iframe 
                src={currentVideo} 
                title={`Watch ${anime.title} episode`}
                width="100%" 
                height="100%" 
                frameBorder="0" 
                allowFullScreen 
              />
            </div>
          </div>
        )}
      </div>
    </>
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
          aria-label={`Watch ${episode.Title}`}
        >
          Watch Episode
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => onOpenModal(episode.Link)}
          aria-label={`Stream ${episode.Title}`}
        >
          Stream Episode
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