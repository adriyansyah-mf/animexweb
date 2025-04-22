"use client";

import Link from "next/link";

const Banner = ({ anime }: { anime: any }) => {
  const episodes = anime?.episodes || [];
  const firstEpisode = episodes.length > 0 ? episodes[episodes.length - 1] : null;

  // Function to convert title to slug format
  const convertToSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  };

  return (
    <div className="relative w-full h-[90vh] text-white">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-500"
        style={{
          backgroundImage: `url("${anime?.banner || "/fallback-banner.jpg"}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: -1,
        }}
      />

      {/* Gradient overlay from bottom to top */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full px-6 md:px-20 pb-24 max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
          {anime?.title}
        </h1>
        <p className="text-base md:text-lg mb-6 text-gray-300 max-w-2xl drop-shadow-md line-clamp-4">
          {anime?.sinopsis}
        </p>

        {/* Genres as tags/cards */}
        <div className="flex flex-wrap gap-2 mb-6">
          {anime?.genres?.map((genre: string, idx: number) => (
            <span
              key={idx}
              className="bg-white/10 border border-white/20 text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm"
            >
              {genre}
            </span>
          ))}
        </div>

        {/* CTA Button (now links to anime detail page) */}
        {firstEpisode?.Link && (
          <Link
            href={`/anime/${convertToSlug(anime.title)}`}
            className="inline-block bg-[#2F88FF] hover:bg-[#1d6fd1] transition-colors duration-300 text-white font-bold font-sans py-2.5 px-7 rounded-md shadow-lg tracking-wide"
          >
            ▶ Watch Now
          </Link>
        )}
      </div>
    </div>
  );
};

export default Banner;
