import React, { useState, useEffect } from "react";
import MovieCard from "../MovieCard";
import HeroBanner from "../HeroBanner";
import MovieModal from "../MovieModal";
import MoviePlayerModal from "../MoviePlayerModal";
import {
  searchMovies,
  getPopularMovies,
  getTrendingMovies,
} from "../../../services/api";

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [playingMovie, setPlayingMovie] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const [popular, trending] = await Promise.all([
          getPopularMovies(),
          getTrendingMovies(),
        ]);
        setMovies(popular);
        if (trending.length > 0) {
          setFeaturedMovie(trending[0]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load movies. Check your internet connection.");
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || loading) return;

    setLoading(true);
    try {
      const searchResults = await searchMovies(searchQuery);
      setMovies(searchResults);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to search movies.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 text-zinc-100">
      {!searchQuery && featuredMovie && (
        <HeroBanner movie={featuredMovie} onWatchTrailer={setPlayingMovie} />
      )}

      <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-10">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search movies by title..."
            className="w-full py-3.5 pl-5 pr-28 rounded-2xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-2 py-2 px-5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-sm rounded-xl transition cursor-pointer"
          >
            Search
          </button>
        </div>
      </form>

      <h2 className="text-xl md:text-2xl font-bold mb-6 tracking-wide text-white">
        {searchQuery ? `Search Results for "${searchQuery}"` : "Popular Movies"}
      </h2>

      {error && (
        <div className="text-amber-300 bg-amber-950/40 border border-amber-800/50 p-4 rounded-xl text-center my-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20 text-zinc-500 font-medium">
          Loading movies...
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {movies.map((movie) => (
            <MovieCard
              movie={movie}
              key={movie.id}
              onSelectMovie={setSelectedMovie}
            />
          ))}
        </div>
      )}

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onWatchMovie={(movie) => {
            setSelectedMovie(null);
            setPlayingMovie(movie);
          }}
        />
      )}

      {playingMovie && (
        <MoviePlayerModal
          movie={playingMovie}
          onClose={() => setPlayingMovie(null)}
        />
      )}
    </div>
  );
}

export default Home;
