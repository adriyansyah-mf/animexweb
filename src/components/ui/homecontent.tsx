"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import GlassmorphismNavbar from "@/components/ui/navbar";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

// Define the type for AnimeCard props
interface AnimeCardProps {
  anime: {
    id: string | number;
    title: string;
    banner: string;
    released_year: string | number;
    genres: string[];
  };
  index: number;
  title?: string;
  selectedGenre: string;
  handleGenreClick: (genre: string) => void;
  convertToSlug: (text: string) => string;
}

// AnimeCard component with proper TypeScript typing
const AnimeCard = ({ anime, index, title = "", selectedGenre, handleGenreClick, convertToSlug }: AnimeCardProps) => {
  return (
    <motion.div
      className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300 text-white flex-shrink-0"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeInUp}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      style={{ width: title ? "280px" : "100%" }} // Fixed width for scrollable sections
    >
      <img
        src={anime.banner}
        alt={anime.title}
        className="w-full h-60 object-cover rounded-lg mb-3"
      />
      <Link href={`/anime/${convertToSlug(anime.title)}-${anime.id}`}>
        <h3 className="text-lg font-bold line-clamp-2 cursor-pointer">
          {anime.title}
        </h3>
      </Link>
      <p className="text-sm text-gray-400">{anime.released_year}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {anime.genres.map((genre: string) => (
          <button
            key={`${anime.id}-${genre}`}
            className={`text-xs px-2 py-1 rounded-full border ${
              selectedGenre === genre
                ? "bg-[#2F88FF] text-white border-[#2F88FF]"
                : "bg-[#2F88FF]/20 text-white border-[#2F88FF] hover:bg-[#2F88FF]/40"
            }`}
            onClick={() => handleGenreClick(genre)}
          >
            {genre}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

// AdContainer component to reuse for all ad placements
const AdContainer = ({ id }: { id: string }) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create the ad scripts
    const script1 = document.createElement('script');
    script1.type = 'text/javascript';
    script1.text = `atOptions = { 'key' : 'b03053da9f4dbc17385dc7f77f3a436a', 'format' : 'iframe', 'height' : 90, 'width' : 728, 'params' : {} };`;
    
    const script2 = document.createElement('script');
    script2.type = 'text/javascript';
    script2.src = '//www.highperformanceformat.com/b03053da9f4dbc17385dc7f77f3a436a/invoke.js';
    
    // Only add the scripts if the adRef container exists and doesn't already have them
    if (adRef.current && !adRef.current.hasChildNodes()) {
      adRef.current.appendChild(script1);
      adRef.current.appendChild(script2);
    }
    
    // Cleanup function
    return () => {
      if (adRef.current) {
        while (adRef.current.firstChild) {
          adRef.current.removeChild(adRef.current.firstChild);
        }
      }
    };
  }, []);

  return (
    <div className="w-full flex justify-center my-8">
      <div ref={adRef} id={id} className="ad-container"></div>
    </div>
  );
};

const HomeContent = () => {
  const [animes, setAnimes] = useState<any[]>([]);
  const [newestAnimes, setNewestAnimes] = useState<any[]>([]);
  const [ongoingAnimes, setOngoingAnimes] = useState<any[]>([]);
  const [completedAnimes, setCompletedAnimes] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const observer = useRef<IntersectionObserver | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const fetchAnimes = async (currentPage: number, searchQuery = "", genreFilter = "") => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: "10",
      });

      if (searchQuery) params.append("search", searchQuery);
      if (genreFilter) params.append("genre", genreFilter);

      const response = await fetch(`${apiUrl}/user/list-anime?${params.toString()}`, {
        headers: { accept: "application/json" },
      });

      if (!response.ok) throw new Error("Failed to fetch anime list");

      const data = await response.json();
      const newAnimes = data.data || [];

      if (currentPage === 1) setAnimes(newAnimes);
      else setAnimes((prev) => [...prev, ...newAnimes]);

      setHasMore(newAnimes.length > 0);
    } catch (error) {
      console.error("Error fetching anime list:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchNewestAnimes = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(
        `${apiUrl}/user/list-anime?page=1&per_page=10`,
        {
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch newest anime");
      const data = await response.json();
      setNewestAnimes(data.data || []);
    } catch (error) {
      console.error("Error fetching newest anime:", error);
    }
  };

  const fetchOngoingAnimes = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(
        `${apiUrl}/user/list-anime?page=1&per_page=10&status=Ongoing`,
        {
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch ongoing anime");
      const data = await response.json();
      setOngoingAnimes(data.data || []);
    } catch (error) {
      console.error("Error fetching ongoing anime:", error);
    }
  };

  const fetchCompletedAnimes = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(
        `${apiUrl}/user/list-anime?page=1&per_page=10&status=Completed`,
        {
          headers: { accept: "application/json" },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch completed anime");
      const data = await response.json();
      setCompletedAnimes(data.data || []);
    } catch (error) {
      console.error("Error fetching completed anime:", error);
    }
  };

  useEffect(() => {
    fetchNewestAnimes();
    fetchOngoingAnimes();
    fetchCompletedAnimes();
  }, []);

  useEffect(() => {
    setPage(1);
    fetchAnimes(1, search, selectedGenre);
  }, [search, selectedGenre]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loading) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchAnimes(nextPage, search, selectedGenre);
      }
    },
    [hasMore, loading, page, search, selectedGenre]
  );

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(handleObserver, {
      rootMargin: "200px",
    });

    if (loaderRef.current) observer.current.observe(loaderRef.current);
  }, [handleObserver]);

  const convertToSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z\d\s-]/g, "").replace(/\s+/g, "-");
  };

  const handleGenreClick = (genre: string) => {
    setSelectedGenre(genre);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const renderScrollableAnimeSection = (title: string, animes: any[]) => {
    if (animes.length === 0) return null;

    return (
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <div className="flex gap-2">
            <button className="scroll-button-left text-white bg-blue-500 hover:bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center shadow-md"
              onClick={(e) => {
                const container = e.currentTarget.parentElement?.parentElement?.nextElementSibling;
                if (container) {
                  container.scrollBy({ left: -600, behavior: 'smooth' });
                }
              }}
            >
              ←
            </button>
            <button className="scroll-button-right text-white bg-blue-500 hover:bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center shadow-md"
              onClick={(e) => {
                const container = e.currentTarget.parentElement?.parentElement?.nextElementSibling;
                if (container) {
                  container.scrollBy({ left: 600, behavior: 'smooth' });
                }
              }}
            >
              →
            </button>
          </div>
        </div>
        <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {animes.map((anime, index) => (
            <AnimeCard
              key={`${title}-${anime.id}-${index}`}
              anime={anime}
              index={index}
              title={title}
              selectedGenre={selectedGenre}
              handleGenreClick={handleGenreClick}
              convertToSlug={convertToSlug}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <GlassmorphismNavbar navItems={[]} onSearch={(q) => setSearch(q)} />
      <div ref={topRef} className="container mx-auto py-10 px-4">
        {/* Ad at the top of the page */}
        <AdContainer id="ad-top" />
        
        {/* Scrollable sections */}
        {renderScrollableAnimeSection("Newest Anime", newestAnimes)}
        
        {/* Ad after Newest Anime section */}
        <AdContainer id="ad-after-newest" />
        
        {renderScrollableAnimeSection("Ongoing Anime", ongoingAnimes)}
        
        {/* Ad after Ongoing Anime section */}
        <AdContainer id="ad-after-ongoing" />
        
        {renderScrollableAnimeSection("Completed Anime", completedAnimes)}
        
        {/* Ad after Completed Anime section */}
        <AdContainer id="ad-after-completed" />

        {/* All Anime Grid Section */}
        <h2 className="text-2xl font-bold text-white mb-6">
          {selectedGenre ? `${selectedGenre} Anime` : "All Anime"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {animes.map((anime, index) => {
            // Insert ad after every 10 anime cards in the main list
            const adAfterItems = index > 0 && (index + 1) % 10 === 0;
            
            return (
              <>
                <AnimeCard
                  key={`all-${anime.id}-${index}`}
                  anime={anime}
                  index={index}
                  selectedGenre={selectedGenre}
                  handleGenreClick={handleGenreClick}
                  convertToSlug={convertToSlug}
                />
                
                {adAfterItems && (
                  <div className="col-span-full my-6">
                    <AdContainer id={`ad-in-list-${Math.floor(index/10)}`} />
                  </div>
                )}
              </>
            );
          })}
        </div>

        <div ref={loaderRef} className="col-span-full flex justify-center mt-10">
          {loading && (
            <div className="flex flex-col items-center text-gray-400 text-sm animate-pulse">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-3"></div>
              <span>Loading more anime...</span>
            </div>
          )}
          {!hasMore && (
            <div className="text-gray-500 text-sm">No more anime to load.</div>
          )}
        </div>
        
        {/* Ad at the bottom of the page */}
        <AdContainer id="ad-bottom" />
      </div>

      {/* CSS for hiding scrollbar */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {selectedGenre && (
        <button
          onClick={() => {
            setSelectedGenre("");
            topRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
          className="fixed top-20 right-4 bg-red-500 text-white px-3 py-1 rounded-full shadow-lg hover:bg-red-600 transition text-xs z-50"
        >
          ✕ {selectedGenre}
        </button>
      )}
    </>
  );
};

export default HomeContent;