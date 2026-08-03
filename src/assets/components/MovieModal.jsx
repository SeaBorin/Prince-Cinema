import React, { useEffect, useState } from "react";
import { getMovieVideos } from "../../services/api";

function MovieModal({ movie, onClose }) {
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movie) return;

    const fetchTrailer = async () => {
      setLoading(true);
      const videos = await getMovieVideos(movie.id);
      const trailer = videos.find(
        (vid) =>
          vid.site === "YouTube" &&
          (vid.type === "Trailer" || vid.type === "Teaser"),
      );
      setTrailerKey(trailer ? trailer.key : videos[0]?.key || null);
      setLoading(false);
    };

    fetchTrailer();
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/60 hover:bg-amber-500 hover:text-zinc-950 text-white rounded-full flex items-center justify-center transition cursor-pointer"
        >
          ✕
        </button>

        <div className="relative aspect-video w-full bg-black">
          {loading ? (
            <div className="flex h-full items-center justify-center text-zinc-400">
              Loading Trailer...
            </div>
          ) : trailerKey ? (
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              title={`${movie.title} Trailer`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="relative h-full w-full">
              <img
                src={`https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path}`}
                alt={movie.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center text-zinc-300 font-semibold">
                No Official Trailer Available
              </div>
            </div>
          )}
        </div>

        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-2xl font-bold text-white">{movie.title}</h2>
            <div className="flex items-center gap-3 text-sm font-medium">
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md">
                ★ {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
              </span>
              <span className="text-zinc-400">
                {movie.release_date?.split("-")[0] || "N/A"}
              </span>
            </div>
          </div>
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed line-clamp-4">
            {movie.overview || "No overview available for this movie."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default MovieModal;
