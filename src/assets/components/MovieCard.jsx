import React from "react";
import { useMovieContext } from "../../contexts/MovieContext.jsx";

function MovieCard({ movie, onSelectMovie }) {
  const { isFavorite, addToFavorites, removeFromFavorites } = useMovieContext();
  const favorite = isFavorite(movie.id);

  function onFavoriteClick(e) {
    e.stopPropagation();
    if (favorite) {
      removeFromFavorites(movie.id);
    } else {
      addToFavorites(movie);
    }
  }

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Poster";

  return (
    <div
      onClick={() => onSelectMovie && onSelectMovie(movie)}
      className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/80 transition-all duration-300 hover:scale-105 hover:border-zinc-700 hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer flex flex-col"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-800">
        <img
          src={posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {movie.vote_average > 0 && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-black/70 backdrop-blur-md text-amber-400 text-xs font-bold rounded-md border border-white/10 flex items-center gap-1 z-10">
            ★ {movie.vote_average.toFixed(1)}
          </div>
        )}

        {/* Favorite Button (z-20 keeps it above overlays) */}
        <button
          type="button"
          onClick={onFavoriteClick}
          className={`absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/90 backdrop-blur-md rounded-full w-9 h-9 flex items-center justify-center transition-transform duration-200 active:scale-90 z-20 ${
            favorite ? "text-amber-500" : "text-zinc-400 hover:text-white"
          }`}
          aria-label="Add to favorites"
        >
          {favorite ? "♥" : "♡"}
        </button>

        {/* Play Trailer Overlay (pointer-events-none lets clicks pass through to the heart) */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 pointer-events-none">
          <span className="text-xs font-bold text-amber-400 bg-amber-950/80 border border-amber-500/40 px-3 py-1.5 rounded-lg w-full text-center backdrop-blur-sm pointer-events-auto">
            ▶ Play Trailer
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <h3 className="text-sm font-bold text-zinc-100 line-clamp-1 group-hover:text-amber-400 transition-colors">
          {movie.title}
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          {movie.release_date?.split("-")[0] || "N/A"}
        </p>
      </div>
    </div>
  );
}

export default MovieCard;
