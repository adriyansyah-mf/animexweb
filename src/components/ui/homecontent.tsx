"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import GlassmorphismNavbar from "@/components/ui/navbar";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const HomeContent = () => {
  const [animes, setAnimes] = useState<any[]>([]);
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

  return (
    <>
      <GlassmorphismNavbar navItems={[]} onSearch={(q) => setSearch(q)} />
      <div
        ref={topRef}
        className="container mx-auto py-10 px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
      >
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
            <Link href={`/anime/${convertToSlug(anime.title)}`}>
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
        ))}

        <div ref={loaderRef} className="col-span-full flex justify-center mt-10">
          {loading && (
            <div className="text-gray-400 text-sm animate-pulse">
              Loading more anime...
            </div>
          )}
          {!hasMore && (
            <div className="text-gray-500 text-sm">No more anime to load.</div>
          )}
        </div>
      </div>

      {selectedGenre && (
        <button
          onClick={() => {
            setSelectedGenre("");
            topRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
          className="fixed bottom-6 right-6 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-red-600 transition"
        >
          Reset Genre
        </button>
      )}
    </>
  );
};

export default HomeContent;
