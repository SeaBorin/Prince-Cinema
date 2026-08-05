import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import NavBar from "./assets/components/NavBar";
import Footer from "./assets/components/Footer";
import BookingModal from "./assets/components/BookingModal";
import PaymentModal from "./assets/components/PaymentModal";
import TicketModal from "./assets/components/TicketModal";
import AuthModal from "./assets/components/AuthModal";

// Import your page components (adjust these paths if your files are located elsewhere)
import Home from "./assets/components/page/Home";
import Favorites from "./assets/components/page/Favorites";
import Services from "./assets/components/page/Services";
import About from "./assets/components/page/About";
import Profile from "./assets/components/page/Profile";

export default function App() {
  const [selectedMovieForBooking, setSelectedMovieForBooking] = useState(null);
  const [bookingData, setBookingData] = useState(null);

  // Modals state management
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  // 1. Triggered when user submits booking in BookingModal
  const handleProceedToPayment = (details) => {
    setBookingData(details);
    setSelectedMovieForBooking(null); // Close booking modal
    setIsPaymentOpen(true); // Open KHQR Payment Modal
  };

  // 2. Triggered when payment simulation succeeds in PaymentModal
  const handlePaymentSuccess = (confirmedBooking) => {
    setIsPaymentOpen(false); // Close payment modal
    setIsTicketOpen(true); // Open final ticket pass modal
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between font-sans">
      <NavBar onOpenAuthModal={() => setIsAuthOpen(true)} />

      {/* --- MAIN PAGE ROUTES --- */}
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                onSelectMovie={(movie) => setSelectedMovieForBooking(movie)}
              />
            }
          />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Booking Modal */}
      <BookingModal
        movie={selectedMovieForBooking}
        isOpen={Boolean(selectedMovieForBooking)}
        onClose={() => setSelectedMovieForBooking(null)}
        onProceedToPayment={handleProceedToPayment}
      />

      {/* KHQR Payment Modal */}
      <PaymentModal
        booking={bookingData}
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Ticket Pass Modal */}
      <TicketModal
        booking={bookingData}
        isOpen={isTicketOpen}
        onClose={() => {
          setIsTicketOpen(false);
          setBookingData(null);
        }}
      />

      <Footer />
    </div>
  );
}
