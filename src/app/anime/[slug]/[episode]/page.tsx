"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Episode {
  Title: string;
  Link: string;
  Date: string;
}

export default function EpisodePage() {
  const { slug, episode } = useParams();
  const [episodeDetails, setEpisodeDetails] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEpisodeDetails = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/user/anime/${slug}/episode/${episode}`, {
          headers: { accept: "application/json" },
        });

        if (!res.ok) throw new Error("Failed to fetch episode details");

        const data = await res.json();
        setEpisodeDetails(data);
      } catch (error) {
        console.error("Error fetching episode:", error);
        setError(error instanceof Error ? error.message : "Failed to load episode");
      } finally {
        setLoading(false);
      }
    };

    if (slug && episode) {
      fetchEpisodeDetails();
    }
  }, [slug, episode]);

  if (loading) return <div>Loading...</div>;
  if (error || !episodeDetails) return <div>{error || "Episode not found"}</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-white mb-4">{episodeDetails.Title}</h1>
      <div className="flex justify-center">
        <iframe
          src={episodeDetails.Link}
          allowFullScreen
          className="w-full max-w-4xl aspect-video"
        />
      </div>
    </div>
  );
}
