import React, { useState } from "react";
import { useMovieContext } from "../../../contexts/MovieContext.jsx";
import MovieCard from "../MovieCard.jsx";
import MovieModal from "../MovieModal.jsx";

function Favorites() {
  const { favorites } = useMovieContext();
  const [selectedMovie, setSelectedMovie] = useState(null);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-[80vh] text-zinc-100">
      <h2 className="mb-8 text-2xl sm:text-3xl font-extrabold tracking-tight text-white border-b border-zinc-800 pb-4 flex items-center gap-3">
        <span>My Favorites</span>
        <span className="text-amber-500 font-bold">({favorites.length})</span>
      </h2>

      {favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {favorites.map((movie) => (
            <MovieCard
              movie={movie}
              key={movie.id}
              onSelectMovie={setSelectedMovie}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-6 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl max-w-lg mx-auto my-12 space-y-3">
          <div className="text-4xl text-amber-500">🎬</div>
          <h3 className="text-xl font-bold text-white">
            No Favorite Movies Yet
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Browse the catalog on the Home page and click the heart icon on any
            movie to build your personal watchlist!
          </p>
        </div>
      )}

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}

export default Favorites;
