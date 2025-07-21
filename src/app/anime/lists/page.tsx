"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import GlassmorphismNavbar from "@/components/ui/navbar";


// Fade-in animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const BrowseAnime = () => {
  const [animes, setAnimes] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const observer = useRef<IntersectionObserver | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Static Filter Options for Genre, Status, and Type (You can replace these with API calls)
  const genres = ["Action", "Adventure", "Comedy", "Drama", "Fantasy"];
  const statuses = ["Ongoing", "Completed", "Upcoming"];
  const types = ["TV", "Movie", "OVA", "Special"];

  // Function to fetch anime with filters and pagination
  const fetchAnimes = async (currentPage: number, searchQuery = "", genreFilter = "", statusFilter = "", typeFilter = "") => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: "10",
      });

      if (searchQuery) params.append("search", searchQuery);
      if (genreFilter) params.append("genre", genreFilter);
      if (statusFilter) params.append("status", statusFilter);
      if (typeFilter) params.append("type", typeFilter);

      const response = await fetch(`${apiUrl}/user/list-anime?${params.toString()}`, {
        headers: { accept: "application/json" },
      });

      if (!response.ok) throw new Error("Failed to fetch anime list");

      const data = await response.json();
      const newAnimes = data.data || [];

      if (currentPage === 1) {
        setAnimes(newAnimes);
      } else {
        setAnimes((prev) => [...prev, ...newAnimes]);
      }

      setHasMore(newAnimes.length > 0);
    } catch (error) {
      console.error("Error fetching anime list:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data whenever filters or page changes
  useEffect(() => {
    setPage(1);
    fetchAnimes(1, search, selectedGenre, selectedStatus, selectedType);
  }, [search, selectedGenre, selectedStatus, selectedType]);

  // Handle intersection observer to load more content
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loading) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchAnimes(nextPage, search, selectedGenre, selectedStatus, selectedType);
      }
    },
    [hasMore, loading, page, search, selectedGenre, selectedStatus, selectedType]
  );

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(handleObserver, {
      rootMargin: "200px",
    });

    if (loaderRef.current) observer.current.observe(loaderRef.current);
  }, [handleObserver]);

  // Convert title to slug
  const convertToSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z\d\s-]/g, "").replace(/\s+/g, "-");
  };

  // Handle genre filter
  const handleGenreClick = (genre: string) => {
    setSelectedGenre(genre);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle status filter
  const handleStatusClick = (status: string) => {
    setSelectedStatus(status);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle type filter
  const handleTypeClick = (type: string) => {
    setSelectedType(type);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header>
        <title>Anime Lists - Otakustream</title>
        <meta name="description" content="Daftar anime terbaru dan terpopuler di Otakustream." />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="OtakuStream" />
        <meta name="language" content="id" />
        <meta name="geo.country" content="ID" />
        <meta name="geo.placename" content="Indonesia" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#2F88FF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Otakustream" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Otakustream" />
      </header>
      <GlassmorphismNavbar navItems={[]} onSearch={(q) => setSearch(q)} />

      <div className="container mx-auto py-10 px-4 mt-20">
        {/* Filters Section */}
        <div className="flex gap-4 mb-6">
          {/* Genre Filter */}
          <div>
            <h4 className="font-semibold">Genre:</h4>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => handleGenreClick(genre)}
                  className={`text-xs px-2 py-1 rounded-full border ${
                    selectedGenre === genre
                      ? "bg-[#2F88FF] text-white border-[#2F88FF]"
                      : "bg-[#2F88FF]/20 text-white border-[#2F88FF] hover:bg-[#2F88FF]/40"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <h4 className="font-semibold">Status:</h4>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusClick(status)}
                  className={`text-xs px-2 py-1 rounded-full border ${
                    selectedStatus === status
                      ? "bg-[#2F88FF] text-white border-[#2F88FF]"
                      : "bg-[#2F88FF]/20 text-white border-[#2F88FF] hover:bg-[#2F88FF]/40"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <h4 className="font-semibold">Type:</h4>
            <div className="flex flex-wrap gap-2">
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeClick(type)}
                  className={`text-xs px-2 py-1 rounded-full border ${
                    selectedType === type
                      ? "bg-[#2F88FF] text-white border-[#2F88FF]"
                      : "bg-[#2F88FF]/20 text-white border-[#2F88FF] hover:bg-[#2F88FF]/40"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reset Filters Button */}
        <button
          onClick={() => {
            setSelectedGenre("");
            setSelectedStatus("");
            setSelectedType("");
            setSearch(""); // Optional, if you want to reset the search as well
            topRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-red-600 transition"
        >
          Reset Filters
        </button>

        {/* Anime Grid */}
        <div ref={topRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-6">
          {animes.map((anime, index) => (
            <motion.div
              key={`${anime.id}-${index}`}
              className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300 text-white"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeInUp}
              transition={{ duration: 0.4, delay: index * 0.05 }}
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
            </motion.div>
          ))}
        </div>

        {/* Loader */}
        <div ref={loaderRef} className="col-span-full flex justify-center mt-10">
          {loading && (
            <div className="text-gray-400 text-sm animate-pulse">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          {!hasMore && (
            <div className="text-gray-500 text-sm">No more anime to load.</div>
          )}
        </div>
      </div>
    </>
  );
};

export default BrowseAnime;
