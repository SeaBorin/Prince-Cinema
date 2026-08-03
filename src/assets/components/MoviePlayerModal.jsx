import React from "react";

function MoviePlayerModal({ movie, onClose }) {
  if (!movie) return null;

  // Stream embed URL using the TMDB ID
  const streamUrl = `https://vidsrc.to/embed/movie/${movie.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/50">
          <div>
            <h3 className="text-lg font-bold text-white">
              {movie.title || movie.name}
            </h3>
            <p className="text-xs text-zinc-400">
              {movie.release_date?.split("-")[0]} • ⭐{" "}
              {movie.vote_average?.toFixed(1)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Player */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={streamUrl}
            title={movie.title || "Movie Player"}
            className="w-full h-full border-0"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
          />
        </div>

        {/* Overview */}
        <div className="p-4 overflow-y-auto space-y-2 max-h-40">
          <h4 className="text-sm font-semibold text-amber-500">Overview</h4>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {movie.overview || "No overview available for this title."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default MoviePlayerModal;
