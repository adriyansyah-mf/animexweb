"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
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
      className="group relative bg-[#1A242F] rounded-md overflow-hidden hover:z-20 transition-all duration-300 flex-shrink-0 transform hover:scale-150 hover:shadow-2xl"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeInUp}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      style={{ width: title ? "280px" : "100%" }}
    >
      {/* Card Image Container */}
      <div className="relative pb-[150%]">
        <img
          src={anime.banner}
          alt={anime.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Multiple Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 bg-gradient-to-l from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content Container */}
        <div className="absolute inset-0 p-4 flex flex-col justify-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          {/* Play Button with Gradient Background */}
          <Link href={`/anime/${convertToSlug(anime.title)}-${anime.id}`}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00A8E1] to-[#0096C7] rounded-full blur-md opacity-50"></div>
                <button className="relative bg-white text-black p-4 rounded-full hover:bg-white/90 transition-colors duration-200">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </Link>

          {/* Bottom Content */}
          <div className="relative">
            {/* Title and Year */}
            <div className="mb-3">
              <Link href={`/anime/${convertToSlug(anime.title)}-${anime.id}`}>
                <h3 className="text-lg font-bold text-white line-clamp-2 mb-1 group-hover:text-[#00A8E1] transition-colors duration-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] [text-shadow:_0_1px_0_rgb(0_0_0_/_40%)]">
                  {anime.title}
                </h3>
              </Link>
              <div className="flex items-center gap-2 text-sm text-gray-200 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                <span>{anime.released_year}</span>
                <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                <span className="border border-gray-200 px-1 rounded">HD</span>
              </div>
            </div>

            {/* Genres with Gradient Background */}
            <div className="flex flex-wrap gap-2">
              {anime.genres.map((genre: string) => (
                <button
                  key={`${anime.id}-${genre}`}
                  className={`text-xs px-2 py-1 rounded-full border transition-all duration-200 relative overflow-hidden ${
                    selectedGenre === genre
                      ? "bg-[#00A8E1] text-white border-[#00A8E1] scale-110"
                      : "bg-[#00A8E1]/20 text-white border-[#00A8E1] hover:bg-[#00A8E1]/40 hover:scale-105"
                  }`}
                  onClick={() => handleGenreClick(genre)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00A8E1]/20 to-[#0096C7]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">{genre}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Bottom Gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
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
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    });

    if (loaderRef.current) observer.current.observe(loaderRef.current);

    return () => {
      if (observer.current) observer.current.disconnect();
    };
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
      <div className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <span className="bg-[#00A8E1] w-1 h-6 mr-3 rounded-full"></span>
            {title}
          </h2>
          <div className="flex gap-2">
            <button 
              className="scroll-button-left text-white bg-[#1A242F] hover:bg-[#2A3441] rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-colors duration-200"
              onClick={(e) => {
                const container = e.currentTarget.parentElement?.parentElement?.nextElementSibling;
                if (container) {
                  container.scrollBy({ left: -600, behavior: 'smooth' });
                }
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              className="scroll-button-right text-white bg-[#1A242F] hover:bg-[#2A3441] rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-colors duration-200"
              onClick={(e) => {
                const container = e.currentTarget.parentElement?.parentElement?.nextElementSibling;
                if (container) {
                  container.scrollBy({ left: 600, behavior: 'smooth' });
                }
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex overflow-x-auto pb-6 gap-6 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="bg-[#00A8E1] w-1 h-6 mr-3 rounded-full"></span>
            {selectedGenre ? `${selectedGenre} Anime` : "All Anime"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {animes.map((anime, index) => {
              const adAfterItems = index > 0 && (index + 1) % 10 === 0;
              
              return (
                <React.Fragment key={`all-${anime.id}-${index}`}>
                  <AnimeCard
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
                </React.Fragment>
              );
            })}
          </div>

          {/* Loading indicator and observer target */}
          <div ref={loaderRef} className="w-full h-20 flex items-center justify-center">
            {loading && (
              <div className="flex flex-col items-center text-gray-400 text-sm">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00A8E1] mb-3"></div>
                <span>Loading more anime...</span>
              </div>
            )}
            {!loading && !hasMore && animes.length > 0 && (
              <div className="text-center text-gray-500 text-sm">
                No more anime to load.
              </div>
            )}
          </div>
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
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          onClick={() => {
            setSelectedGenre("");
            topRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
          className="fixed top-20 right-4 bg-[#00A8E1] text-white px-4 py-2 rounded-full shadow-lg hover:bg-[#0096C7] transition-colors duration-200 text-sm font-medium z-50 flex items-center gap-2"
        >
          <span>✕</span>
          <span>{selectedGenre}</span>
        </motion.button>
      )}
    </>
  );
};

export default HomeContent;