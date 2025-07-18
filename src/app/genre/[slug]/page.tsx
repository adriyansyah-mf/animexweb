"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Anime {
  id: number;
  title: string;
  status: string;
  banner: string;
  genres: string[];
  released_year: string;
}

export default function GenrePage() {
  const { slug } = useParams();
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    // Ensure slug is a string
    const slugStr = Array.isArray(slug) ? slug[0] : slug;
    // Convert slug to genre name (replace dash with space, capitalize each word)
    const genreName = slugStr
      .split("-")
      .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
    fetch(`${apiUrl}/user/list-anime?page=1&per_page=20&genre=${encodeURIComponent(genreName)}`, {
      headers: { accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data anime.");
        return res.json();
      })
      .then((data) => {
        setAnimes(data.data || []);
      })
      .catch((err) => {
        setError(err.message || "Terjadi kesalahan.");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  // Ensure slug is a string for display
  const slugStr = Array.isArray(slug) ? slug[0] : slug;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 capitalize">Genre: {slugStr?.replace(/-/g, " ")}</h1>
      {animes.length === 0 ? (
        <div className="text-gray-400">Tidak ada anime ditemukan untuk genre ini.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {animes.map((anime) => (
            <div key={anime.id} className="bg-white/10 rounded-lg p-4 shadow text-white">
              <Image
                src={anime.banner}
                alt={anime.title}
                width={247}
                height={350}
                className="rounded mb-2 object-cover"
              />
              <Link href={`/anime/${anime.title.toLowerCase().replace(/[^a-z\d\s-]/g, '').replace(/\s+/g, '-')}-${anime.id}`}>
                <h2 className="font-semibold text-lg line-clamp-2 hover:underline">{anime.title}</h2>
              </Link>
              <div className="text-xs text-gray-300 mb-1">{anime.released_year}</div>
              <div className="text-xs mb-1">Status: {anime.status}</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {anime.genres.map((g) => (
                  <span key={g} className="bg-blue-600/80 px-2 py-0.5 rounded text-xs">{g}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 