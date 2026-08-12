import React, { useState, useEffect } from "react";
import { getPopularMovies, searchMovies } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import { db } from "../../../firebase";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import MovieCard from "../MovieCard";
import HeroBanner from "../HeroBanner";
import MovieModal from "../MovieModal";
import BookingModal from "../BookingModal";
import PaymentModal from "../PaymentModal";
import TicketModal from "../TicketModal";

function Home({ onRequireAuth }) {
  const { user, currentUser } = useAuth();
  const activeUser = user || currentUser;

  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [bookingMovie, setBookingMovie] = useState(null);

  const [pendingBooking, setPendingBooking] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const processMovies = (movieList) => {
    return [...movieList].sort((a, b) => {
      const dateA = a.release_date ? new Date(a.release_date) : new Date(0);
      const dateB = b.release_date ? new Date(b.release_date) : new Date(0);
      return dateB - dateA;
    });
  };

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const popular = await getPopularMovies();
        setMovies(processMovies(popular));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadMovies();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const results = await searchMovies(searchQuery);
      setMovies(processMovies(results));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookMovie = (movie) => {
    if (!activeUser && onRequireAuth) {
      onRequireAuth();
      return;
    }
    setBookingMovie(movie);
  };

  const handleProceedToPayment = (bookingData) => {
    setPendingBooking(bookingData);
  };

  const handleCancelPayment = () => {
    setPendingBooking(null);
  };

  const handleClosePayment = () => {
    setPendingBooking(null);
    setBookingMovie(null);
  };

  const handlePaymentSuccess = async (paidBooking) => {
    setPendingBooking(null);
    setBookingMovie(null);
    setConfirmedBooking(paidBooking);

    if (activeUser) {
      try {
        // Use the human-readable booking code as the document ID so
        // staff can look it up directly when scanning at the door
        const referenceCode = paidBooking.bookingId || `TICKET-${Date.now()}`;

        const bookingRef = doc(db, "bookings", referenceCode);
        await setDoc(bookingRef, {
          ...paidBooking,
          type: "ticket",
          uid: activeUser.uid,
          checkedIn: false,
          createdAt: serverTimestamp(),
          status: "CONFIRMED",
        });

        // Mark these seats as taken for this specific showtime so
        // BookingModal's real-time listener disables them for everyone
        const showBookingsRef = collection(
          db,
          "shows",
          paidBooking.showId,
          "bookings",
        );
        await addDoc(showBookingsRef, {
          seats: paidBooking.seats,
          userId: activeUser.uid,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error saving booking to Firestore:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 max-w-7xl mx-auto space-y-8">
      {movies.length > 0 && (
        <HeroBanner
          movie={movies[0]}
          onWatchTrailer={(m) => setSelectedMovie(m)}
        />
      )}

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          placeholder="Search movies now showing in Cambodia..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          type="submit"
          className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-xs transition cursor-pointer"
        >
          Search
        </button>
      </form>

      <div>
        <h2 className="text-xl font-bold mb-4 text-zinc-200">Now Showing</h2>
        {loading ? (
          <p className="text-zinc-500 text-sm">Loading movies...</p>
        ) : movies.length === 0 ? (
          <p className="text-zinc-400 text-sm">No movies found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelectMovie={(m) => setSelectedMovie(m)}
                onBookMovie={handleBookMovie}
                onRequireAuth={onRequireAuth}
              />
            ))}
          </div>
        )}
      </div>

      <MovieModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />

      <BookingModal
        movie={bookingMovie}
        isOpen={Boolean(bookingMovie) && !pendingBooking}
        onClose={() => setBookingMovie(null)}
        onProceedToPayment={handleProceedToPayment}
        onRequireAuth={onRequireAuth}
      />

      <PaymentModal
        booking={pendingBooking}
        isOpen={Boolean(pendingBooking)}
        onClose={handleClosePayment}
        onBack={handleCancelPayment}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <TicketModal
        booking={confirmedBooking}
        isOpen={Boolean(confirmedBooking)}
        onClose={() => setConfirmedBooking(null)}
      />
    </div>
  );
}

export default Home;
