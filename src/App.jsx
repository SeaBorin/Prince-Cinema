import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MovieProvider } from "./contexts/MovieContext";

import NavBar from "./assets/components/NavBar";
import Footer from "./assets/components/Footer";
import AuthModal from "./assets/components/AuthModal";

import Home from "./assets/components/page/Home";
import FoodList from "./assets/components/page/FoodList";
import Favorites from "./assets/components/page/Favorites";
import About from "./assets/components/page/About";
import Services from "./assets/components/page/Services";
import Profile from "./assets/components/page/Profile";
import StaffCheckIn from "./assets/components/page/StaffCheckIn";
import AdminUsers from "./assets/components/page/AdminUsers";

function AppLayout() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between">
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
          <Route path="/staff-checkin" element={<StaffCheckIn />} />
          <Route path="/admin-users" element={<AdminUsers />} />
        </Routes>
      </main>

      <Footer />

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
