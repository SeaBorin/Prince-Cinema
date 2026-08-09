import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MovieProvider } from "./contexts/MovieContext";
import { useAuth } from "./contexts/AuthContext";

import NavBar from "./assets/components/NavBar";
import Footer from "./assets/components/Footer";
import AuthModal from "./assets/components/AuthModal";

import Home from "./assets/components/page/Home";
import FoodList from "./assets/components/page/FoodList";
import Favorites from "./assets/components/page/Favorites";
import About from "./assets/components/page/About";
import Services from "./assets/components/page/Services";
import Profile from "./assets/components/page/Profile";

function VerifyEmailBanner() {
  const { user, resendVerificationEmail } = useAuth() || {};
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!user || user.emailVerified || dismissed) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await resendVerificationEmail();
      setSent(true);
    } catch (err) {
      console.error("Error resending verification email:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-300 text-xs px-4 py-2.5 flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
      <span>
        Please verify your email ({user.email}) to secure your account and make
        sure you never lose access to it.
        {sent && " Verification email sent — check your inbox!"}
      </span>
      <div className="flex items-center gap-3">
        <button
          onClick={handleResend}
          disabled={sending}
          className="font-bold underline hover:text-amber-200 transition disabled:opacity-50"
        >
          {sending ? "Sending..." : "Resend Email"}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-400/70 hover:text-amber-200 transition"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function AppLayout() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between">
      {/* Email Verification Reminder Banner */}
      <VerifyEmailBanner />

      {/* Global Single Navbar */}
      <NavBar onOpenAuthModal={() => setIsAuthOpen(true)} />

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={<Home onRequireAuth={() => setIsAuthOpen(true)} />}
          />
          <Route
            path="/foods"
            element={<FoodList onRequireAuth={() => setIsAuthOpen(true)} />}
          />
          <Route
            path="/favorites"
            element={<Favorites onRequireAuth={() => setIsAuthOpen(true)} />}
          />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>

      {/* Global Single Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MovieProvider>
        <AppLayout />
      </MovieProvider>
    </AuthProvider>
  );
}
