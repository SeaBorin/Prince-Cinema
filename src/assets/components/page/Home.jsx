// src/assets/components/page/Home.jsx

import React, { useState, useEffect } from "react";
import { getPopularMovies, searchMovies } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import { db } from "../../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import MovieCard from "../MovieCard";
import HeroBanner from "../HeroBanner";
import MovieModal from "../MovieModal";
import BookingModal from "../BookingModal";
import PaymentModal from "../PaymentModal";
import TicketModal from "../TicketModal";
import AuthModal from "../AuthModal";

function Home() {
  const { user, currentUser } = useAuth();
  const activeUser = user || currentUser;

  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [bookingMovie, setBookingMovie] = useState(null);

  // Modal Auth Trigger State
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Payment and Ticket States
  const [pendingBooking, setPendingBooking] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sorts ALL movies by release_date so newest releases show first
  const processMovies = (movieList) => {
    return [...movieList].sort((a, b) => {
      const dateA = a.release_date ? new Date(a.release_date) : new Date(0);
      const dateB = b.release_date ? new Date(b.release_date) : new Date(0);
      return dateB - dateA; // Newest date comes first
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
    // 🔒 RESTRICT GUEST ACCOUNTS: Force sign-in if not authenticated
    if (!activeUser) {
      setIsAuthOpen(true);
      return;
    }
    setBookingMovie(movie);
  };

  const handleProceedToPayment = (bookingData) => {
    setBookingMovie(null);
    setPendingBooking(bookingData);
  };

  // Save successful order directly to Firestore under user subcollection
  const handlePaymentSuccess = async (paidBooking) => {
    setPendingBooking(null);
    setConfirmedBooking(paidBooking);

    if (activeUser) {
      try {
        const userBookingsRef = collection(
          db,
          "users",
          activeUser.uid,
          "bookings",
        );
        await addDoc(userBookingsRef, {
          ...paidBooking,
          createdAt: serverTimestamp(),
          status: "CONFIRMED",
        });
      } catch (error) {
        console.error("Error saving booking to Firestore:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 max-w-7xl mx-auto">
      {movies.length > 0 && (
        <HeroBanner
          movie={movies[0]}
          onWatchTrailer={(m) => setSelectedMovie(m)}
        />
      )}

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8 flex gap-3">
        <input
          type="text"
          placeholder="Search movies now showing in Cambodia..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          type="submit"
          className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-sm transition"
        >
          Search
        </button>
      </form>

      {/* Movie Grid */}
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
              onRequireAuth={() => setIsAuthOpen(true)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <MovieModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />

      {/* 1. Seat & Food Selection */}
      <BookingModal
        movie={bookingMovie}
        isOpen={Boolean(bookingMovie)}
        onClose={() => setBookingMovie(null)}
        onProceedToPayment={handleProceedToPayment}
        onRequireAuth={() => setIsAuthOpen(true)}
      />

      {/* Auth Modal Triggered when not signed in */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* 2. KHQR / ABA Payment Modal */}
      <PaymentModal
        booking={pendingBooking}
        isOpen={Boolean(pendingBooking)}
        onClose={() => setPendingBooking(null)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* 3. Confirmed Digital Ticket Pass */}
      <TicketModal
        booking={confirmedBooking}
        isOpen={Boolean(confirmedBooking)}
        onClose={() => setConfirmedBooking(null)}
      />
    </div>
  );
}

export default Home;
