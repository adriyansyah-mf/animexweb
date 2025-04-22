"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, FilmIcon, User } from "lucide-react";
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

  useEffect(() => {
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

  const animeTitleForMeta = anime ? `${anime.title} - ${siteSettings?.site_name} Sub Indo Gratis` : "";
  const metaDescription = anime ? `${siteSettings?.site_name}, ${anime.title} streaming anime gratis sub indo` : "";

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
      {/* SEO Metadata */}
      <Head>
        <title>{animeTitleForMeta}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={siteSettings.site_keywords} />
        <meta property="og:title" content={animeTitleForMeta} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={anime.banner} />
        <meta name="twitter:title" content={animeTitleForMeta} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={anime.banner} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div className="container mx-auto py-8 px-4 md:px-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="md:col-span-1">
            <div className="relative rounded-lg overflow-hidden h-96 md:h-auto w-full mb-6 shadow-lg hover:scale-105 transition-all duration-300 mt-40">
              {isExternalImage(anime.banner) ? (
                <img src={anime.banner} alt={anime.title} className="object-cover w-full h-full" />
              ) : (
                <Image src={anime.banner} alt={anime.title} fill className="object-cover" priority />
              )}
            </div>

            <div className="space-y-4 bg-black/40 p-4 rounded-lg backdrop-blur-lg">
              <AnimeInfoRow icon={<FilmIcon />} text={`${anime.type} • ${anime.status}`} />
              <AnimeInfoRow icon={<Calendar />} text={`${anime.released_year} • ${anime.season}`} />
              <AnimeInfoRow icon={<User />} text={`Posted by ${anime.posted_by}`} />
              <AnimeInfoRow icon={<Clock />} text={`Updated on ${anime.updated_on}`} />

              <div className="pt-2">
                <p className="text-sm text-white font-medium mb-2">Studio</p>
                <p className="text-sm text-white">{anime.studio}</p>
              </div>

              <div className="pt-2">
                <p className="text-sm text-white font-medium mb-2">Genres</p>
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((genre) => (
                    <Badge key={genre} variant="outline" className="bg-white text-black">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-2">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 mt-40">{anime.title}</h1>

            <div className="mb-6 mt-4">
              <h2 className="text-xl font-semibold text-white mb-2">Synopsis</h2>
              <p className="text-gray-300">{anime.sinopsis}</p>
            </div>

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
                      <EpisodeCard key={episode.Number} episode={episode} onOpenModal={handleOpenModal} />
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
              <button className="absolute top-0 right-0 p-4 text-white" onClick={handleCloseModal}>
                X
              </button>
              <iframe src={currentVideo} width="100%" height="100%" frameBorder="0" allowFullScreen />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Reusable Component
function AnimeInfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-muted-foreground">{icon}</div>
      <span className="text-sm text-white">{text}</span>
    </div>
  );
}

function EpisodeCard({ episode, onOpenModal }: { episode: Episode; onOpenModal: (url: string) => void }) {
  return (
    <div className="bg-black/40 p-4 rounded-lg backdrop-blur-lg hover:bg-black/50 transition-colors">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-lg text-white">{episode.Title}</h3>
        <span className="text-sm text-gray-400">{episode.Date}</span>
      </div>
      <div className="mt-4 flex gap-3">
        <Button variant="outline" size="sm" onClick={() => onOpenModal(episode.Link)}>
          Watch Episode
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onOpenModal(episode.Link)}>
          Stream Episode
        </Button>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 mt-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Skeleton className="h-96 w-full rounded-lg mb-6" />
        </div>
        <div className="md:col-span-2">
          <Skeleton className="h-10 mb-6" />
          <Skeleton className="h-4 mb-4" />
          <Skeleton className="h-4 mb-4" />
          <Skeleton className="h-10 mb-4" />
        </div>
      </div>
    </div>
  );
}
