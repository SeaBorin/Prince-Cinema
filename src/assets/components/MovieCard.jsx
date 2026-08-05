import React from "react";
import { useMovieContext } from "../../contexts/MovieContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { doc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../../firebase.js";

export const toggleFavoriteMovie = async (userId, movie, isFavorite) => {
  if (!userId) return;
  const userRef = doc(db, "users", userId);
  if (isFavorite) {
    await setDoc(userRef, { favorites: arrayRemove(movie) }, { merge: true });
  } else {
    await setDoc(userRef, { favorites: arrayUnion(movie) }, { merge: true });
  }
};

function MovieCard({ movie, onSelectMovie, onBookMovie, onRequireAuth }) {
  const { user, currentUser } = useAuth();
  const activeUser = user || currentUser;
  const { isFavorite, addToFavorites, removeFromFavorites } = useMovieContext();
  const favorite = isFavorite(movie.id);

  // Helper function to check if the movie was released within 30 days (1 month)
  const isMovieActiveInTheaters = (releaseDateStr) => {
    if (!releaseDateStr) return true;
    const releaseDate = new Date(releaseDateStr);
    const now = new Date();

    const diffTime = now - releaseDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    return diffDays >= 0 && diffDays <= 30;
  };

  const isAvailableForTickets = isMovieActiveInTheaters(movie.release_date);

  // Helper to format release_date to Full Date (e.g., "Oct 24, 2024")
  const formatFullDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return dateStr;

    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  function onFavoriteClick(e) {
    e.stopPropagation();
    if (!activeUser) {
      if (typeof onRequireAuth === "function") {
        onRequireAuth();
      } else {
        alert("Please sign in to add movies to your favorites.");
      }
      return;
    }

    if (favorite) {
      removeFromFavorites(movie.id);
    } else {
      addToFavorites(movie);
    }
  }

  const handleTicketClick = (e) => {
    e.stopPropagation();
    if (!isAvailableForTickets) return;

    if (!activeUser) {
      if (typeof onRequireAuth === "function") {
        onRequireAuth();
      } else {
        alert("Please sign in to purchase tickets.");
      }
      return;
    }

    if (onBookMovie) {
      onBookMovie(movie);
    }
  };

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

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 gap-2">
          {isAvailableForTickets ? (
            <button
              onClick={handleTicketClick}
              className="text-xs font-bold text-zinc-950 bg-amber-500 hover:bg-amber-400 py-2 rounded-lg text-center shadow-md transition"
            >
              🎟️ Get Tickets
            </button>
          ) : (
            <div className="text-xs font-semibold text-rose-400 bg-zinc-900/90 border border-rose-500/20 py-2 rounded-lg text-center backdrop-blur-sm">
              🚫 Out of Theaters
            </div>
          )}
          <span className="text-[11px] font-semibold text-zinc-300 bg-zinc-900/80 py-1.5 rounded-lg text-center backdrop-blur-sm">
            ▶ Play Trailer
          </span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <h3 className="text-sm font-bold text-zinc-100 line-clamp-1 group-hover:text-amber-400 transition-colors">
          {movie.title}
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          {formatFullDate(movie.release_date)}
        </p>
      </div>
    </div>
  );
}

export default MovieCard;
