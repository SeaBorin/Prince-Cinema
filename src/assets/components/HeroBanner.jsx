import React from "react";

function HeroBanner({ movie, onWatchTrailer }) {
  if (!movie) return null;

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : `https://image.tmdb.org/t/p/original${movie.poster_path}`;

  return (
    <div className="relative w-full h-[55vh] md:h-[65vh] rounded-2xl overflow-hidden mb-8 border border-zinc-800">
      <img
        src={backdropUrl}
        alt={movie.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent flex items-end p-6 md:p-12">
        <div className="max-w-2xl space-y-4">
          <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold tracking-wider uppercase">
            Featured Spotlight
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
            {movie.title}
          </h1>
          <p className="text-zinc-300 text-sm md:text-base line-clamp-3 leading-relaxed">
            {movie.overview}
          </p>
          <div className="flex gap-4 pt-2">
            <button
              onClick={() => onWatchTrailer(movie)}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-sm flex items-center gap-2 transition duration-200 cursor-pointer shadow-lg shadow-amber-500/30"
            >
              ▶ Watch Trailer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroBanner;
