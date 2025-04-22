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
import Link from "next/link";
import Head from "next/head"; // Import Head from next/head

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

// Function to convert title to slug format
const convertToSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
};

export default function AnimeDetailPage() {
  const params = useParams();
  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const slug = params?.slug as string;

  useEffect(() => {
    const fetchAnimeDetail = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        
        // First, get the ID from slug by fetching list and finding matching anime
        const listRes = await fetch(`${apiUrl}/user/list-anime?page=1&per_page=100`, {
          headers: { accept: "application/json" },
        });

        if (!listRes.ok) throw new Error("Failed to fetch anime list");
        
        const listData = await listRes.json();
        // Find the anime with matching title (converted to slug)
        const animeData = listData.data.find((item: any) => 
          convertToSlug(item.title) === slug
        );
        
        if (!animeData) {
          throw new Error("Anime not found");
        }

        // Fetch the anime details using the ID
        const detailRes = await fetch(`${apiUrl}/user/anime/${animeData.id}`, {
          headers: { accept: "application/json" },
        });

        if (!detailRes.ok) throw new Error("Failed to fetch anime details");
        
        const animeDetail = await detailRes.json();
        setAnime(animeDetail);
      } catch (error) {
        console.error("Error fetching anime:", error);
        setError(error instanceof Error ? error.message : "Failed to load anime");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchAnimeDetail();
    }
  }, [slug]);

  const handleOpenModal = (videoUrl: string) => {
    setCurrentVideo(videoUrl);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentVideo(null);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

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

  // Check if image source is external and use a regular <img> tag for external URLs
  const isExternalImage = (url: string) => {
    return url.startsWith("http://") || url.startsWith("https://");
  };

  return (
    <>
      {/* SEO Metadata */}
      <Head>
        <title>{anime.title} - Anime Detail</title>
        <meta name="description" content={anime.sinopsis} />
        <meta name="keywords" content={anime.genres.join(", ")} />
        <meta property="og:title" content={anime.title} />
        <meta property="og:description" content={anime.sinopsis} />
        <meta property="og:image" content={anime.banner} />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:title" content={anime.title} />
        <meta name="twitter:description" content={anime.sinopsis} />
        <meta name="twitter:image" content={anime.banner} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div className="container mx-auto py-8 px-4 md:px-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Poster and Info */}
          <div className="md:col-span-1">
            <div className="relative rounded-lg overflow-hidden h-96 md:h-auto w-full mb-6 shadow-lg hover:scale-105 transition-all duration-300 mt-40">
              {isExternalImage(anime.banner) ? (
                <img src={anime.banner} alt={anime.title} className="object-cover w-full h-full" />
              ) : (
                <Image 
                  src={anime.banner} 
                  alt={anime.title}
                  fill
                  className="object-cover"
                  priority
                />
              )}
            </div>
            
            <div className="space-y-4 bg-black/40 p-4 rounded-lg backdrop-blur-lg">
              <div className="flex items-center gap-2">
                <FilmIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-white">{anime.type} • {anime.status}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-white">{anime.released_year} • {anime.season}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-white">Posted by {anime.posted_by}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-white">Updated on {anime.updated_on}</span>
              </div>
              
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
          
          {/* Right Column - Details and Episodes */}
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
                      <EpisodeCard 
                        key={episode.Number} 
                        episode={episode} 
                        animeTitle={anime.title} 
                        onOpenModal={handleOpenModal} 
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
                className="absolute top-0 right-0 p-4 text-white"
                onClick={handleCloseModal}
              >
                X
              </button>
              <iframe
                src={currentVideo}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Episode Card Component
function EpisodeCard({ episode, animeTitle, onOpenModal }: { episode: Episode, animeTitle: string, onOpenModal: (url: string) => void }) {
  return (
    <div className="bg-black/40 p-4 rounded-lg backdrop-blur-lg hover:bg-black/50 transition-colors">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-lg text-white">{episode.Title}</h3>
        <span className="text-sm text-gray-400">{episode.Date}</span>
      </div>
      <div className="mt-4 flex gap-3">
        {/* Watch Episode */}
        <Button variant="outline" size="sm" onClick={() => onOpenModal(episode.Link)}>
          Watch Episode
        </Button>

        {/* Stream Episode */}
        <Button variant="secondary" size="sm" onClick={() => onOpenModal(episode.Link)}>
          Stream Episode
        </Button>
      </div>
    </div>
  );
}

// Loading Skeleton
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
