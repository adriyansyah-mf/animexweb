"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, FilmIcon, User, Home, Share2 } from "lucide-react";

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

interface AnimeDetailClientProps {
  initialAnimeData?: AnimeDetail;
  initialSettings?: SiteSettings;
  animeId: string;
}

export default function AnimeDetailClient({ 
  initialAnimeData, 
  initialSettings, 
  animeId 
}: AnimeDetailClientProps) {
  const [anime, setAnime] = useState<AnimeDetail | null>(initialAnimeData || null);
  const [loading, setLoading] = useState(!initialAnimeData);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(initialSettings || null);
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [browserLanguage, setBrowserLanguage] = useState("id-ID");
  const [isIndonesia, setIsIndonesia] = useState(true);

  useEffect(() => {
    // Set canonical URL
    setCanonicalUrl(`${window.location.origin}${window.location.pathname}`);
    
    // Detect language and region
    if (typeof navigator !== 'undefined') {
      setBrowserLanguage(navigator.language || "id-ID");
      
      // Try to detect if user is from Indonesia
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          setIsIndonesia(data.country_code === 'ID');
        })
        .catch(() => {
          setIsIndonesia(true);
        });
    }

    // Only fetch if we don't have initial data
    if (!initialAnimeData || !initialSettings) {
      const fetchData = async () => {
        try {
          // Fetch site settings if not provided
          if (!initialSettings) {
            const settingsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings`, {
              method: "GET",
              headers: { accept: "application/json" },
            });

            if (!settingsRes.ok) throw new Error("Failed to fetch site settings");
            const settingsData = await settingsRes.json();
            setSiteSettings(settingsData);
          }

          // Fetch anime details if not provided
          if (!initialAnimeData && animeId) {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const detailRes = await fetch(`${apiUrl}/user/anime/${animeId}`, {
              headers: { accept: "application/json" },
            });

            if (!detailRes.ok) throw new Error("Failed to fetch anime details");
            const animeDetail = await detailRes.json();
            setAnime(animeDetail);
            
            // Preload banner image
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
          }
        } catch (err) {
          setError("Gagal mengambil data. Silakan coba lagi nanti.");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else {
      setLoading(false);
    }
  }, [animeId, initialAnimeData, initialSettings]);

  const handleOpenModal = (videoUrl: string) => {
    setCurrentVideo(videoUrl);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentVideo(null);
  };

  const isExternalImage = (url: string) => {
    return url?.startsWith("http://") || url?.startsWith("https://");
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