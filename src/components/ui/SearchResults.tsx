import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// Type definitions for the anime data
interface Anime {
  id: number;
  title: string;
  status: string;
  banner: string;
  genres: string[];
  released_year: string | null;
}

interface SearchResponse {
  page: number;
  per_page: number;
  total: number;
  data: Anime[];
}

const convertToSlug = (text: string) => {
  return text.toLowerCase().replace(/[^a-z\d\s-]/g, "").replace(/\s+/g, "-");
};

// Loading skeleton component
const SearchResultSkeleton = () => (
  <div className="bg-[#1A242F] rounded-lg overflow-hidden animate-pulse">
    <div className="relative pb-[140%] bg-[#2A3441]"></div>
    <div className="p-3">
      <div className="h-4 bg-[#2A3441] rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-[#2A3441] rounded w-1/2"></div>
      <div className="flex gap-2 mt-3">
        <div className="h-6 bg-[#2A3441] rounded w-16"></div>
        <div className="h-6 bg-[#2A3441] rounded w-16"></div>
      </div>
    </div>
  </div>
);

// Quick preview component
const QuickPreview = ({ anime }: { anime: Anime }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="space-y-2">
        <h3 className="text-white text-lg font-medium line-clamp-2">{anime.title}</h3>
        <div className="flex flex-wrap gap-1">
          {anime.genres.map((genre, index) => (
            <span
              key={index}
              className="text-xs bg-[#00A8E1]/20 text-[#00A8E1] px-2 py-1 rounded-full"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-sm">{anime.released_year}</span>
        <button 
          className="bg-[#00A8E1] text-white px-4 py-2 rounded-full hover:bg-[#0089b8] transition-colors transform hover:scale-105"
          onClick={(e) => {
            e.preventDefault();
            const slug = `${convertToSlug(anime.title)}-${anime.id}`;
            window.location.href = `/anime/${slug}`;
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

const SearchResults = ({ 
  searchQuery,
  isOpen,
  onClose 
}: {
  searchQuery: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!results?.data) return;

    switch (e.key) {
      case "Escape":
        onClose();
        break;
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => 
          Math.min(prev + 1, results.data.length - 1)
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        const selectedAnime = results.data[selectedIndex];
        if (selectedAnime) {
          const slug = `${convertToSlug(selectedAnime.title)}-${selectedAnime.id}`;
          window.location.href = `/anime/${slug}`;
          onClose();
        }
        break;
    }
  }, [results, selectedIndex, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      modalRef.current?.focus();
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    if (isOpen && searchQuery.trim()) {
      fetchSearchResults();
    }
  }, [searchQuery, isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = resultsRef.current?.children[selectedIndex] as HTMLElement;
    if (selectedElement) {
      selectedElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }, [selectedIndex]);

  const fetchSearchResults = async () => {
    setLoading(true);
    setError("");
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.otakustream.xyz";
      const response = await fetch(
        `${apiUrl}/user/list-anime?page=1&per_page=10&search=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }

      const data = await response.json();
      setResults(data);
      setSelectedIndex(0);
    } catch (err) {
      console.error("Error fetching search results:", err);
      setError("Failed to fetch search results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto animate-fadeIn"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Search results"
    >
      <div className="absolute top-0 left-0 w-full bg-[#0F171E] border-b border-[#2A3441] animate-slideDown">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-xl font-medium">
              Search Results for "{searchQuery}"
            </h2>
            <button
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-[#2A3441] focus:outline-none focus:ring-2 focus:ring-[#00A8E1] transform hover:scale-110"
              onClick={onClose}
              aria-label="Close search results"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 pb-8">
              {[...Array(10)].map((_, index) => (
                <SearchResultSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="text-red-400 text-center py-8 bg-red-900/20 rounded-lg">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          ) : results && results.data.length > 0 ? (
            <div 
              ref={resultsRef}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 pb-8"
            >
              {results.data.map((anime, index) => {
                const slug = `${convertToSlug(anime.title)}-${anime.id}`;
                const isSelected = index === selectedIndex;
                
                return (
                  <div
                    key={anime.id}
                    className={`group relative bg-[#1A242F] rounded-lg overflow-hidden transition-all duration-300 shadow-lg cursor-pointer
                      ${isSelected ? 'ring-2 ring-[#00A8E1] scale-105' : 'hover:scale-105'}
                      focus:outline-none focus:ring-2 focus:ring-[#00A8E1]`}
                    onMouseEnter={() => {
                      setHoveredIndex(index);
                      setSelectedIndex(index);
                    }}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="relative pb-[140%]">
                      <img
                        src={anime.banner}
                        alt={anime.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = "/api/placeholder/240/320";
                        }}
                      />
                      <div className="absolute top-2 right-2 bg-[#00A8E1] text-xs font-bold px-2 py-1 rounded-full transform transition-transform duration-300 group-hover:scale-110">
                        {anime.status}
                      </div>
                      <QuickPreview anime={anime} />
                    </div>
                    <div className="p-3">
                      <h3 className="text-white font-medium line-clamp-2 h-12 group-hover:text-[#00A8E1] transition-colors">
                        {anime.title}
                      </h3>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {anime.genres.slice(0, 2).map((genre, index) => (
                          <span
                            key={index}
                            className="text-xs bg-[#2A3441] text-gray-300 px-2 py-1 rounded-full transition-colors group-hover:bg-[#00A8E1]/20 group-hover:text-[#00A8E1]"
                          >
                            {genre}
                          </span>
                        ))}
                        {anime.genres.length > 2 && (
                          <span className="text-xs bg-[#2A3441] text-gray-300 px-2 py-1 rounded-full transition-colors group-hover:bg-[#00A8E1]/20 group-hover:text-[#00A8E1]">
                            +{anime.genres.length - 2}
                          </span>
                        )}
                      </div>
                      {anime.released_year && (
                        <div className="text-gray-400 text-xs mt-2 group-hover:text-[#00A8E1] transition-colors">
                          {anime.released_year}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8 bg-[#1A242F] rounded-lg">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              No results found for "{searchQuery}"
            </div>
          )}

          {results && results.data.length > 0 && (
            <div className="flex justify-between items-center py-4 border-t border-[#2A3441]">
              <div className="text-gray-400 text-sm">
                Showing {results.data.length} of {results.total} results
              </div>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 bg-[#1A242F] text-white rounded-full hover:bg-[#2A3441] disabled:opacity-50 disabled:cursor-not-allowed
                    focus:outline-none focus:ring-2 focus:ring-[#00A8E1] transition-all transform hover:scale-105"
                  disabled={results.page === 1}
                >
                  Previous
                </button>
                <button
                  className="px-4 py-2 bg-[#00A8E1] text-white rounded-full hover:bg-[#0089b8] disabled:opacity-50 disabled:cursor-not-allowed
                    focus:outline-none focus:ring-2 focus:ring-[#00A8E1] transition-all transform hover:scale-105"
                  disabled={results.page * results.per_page >= results.total}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;