import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMovieContext } from "../../contexts/MovieContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import AuthModal from "./AuthModal.jsx";
import logoImg from "../../assets/prince-cinema-img.png";

function NavBar() {
  const location = useLocation();
  const { favorites } = useMovieContext();
  const { user, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between text-white">
        {/* Brand Logo & Image */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logoImg}
            alt="Prince Cinema Logo"
            className="w-10 h-10 object-contain rounded-lg transition-transform group-hover:scale-105"
          />
          <span className="text-2xl font-black text-amber-500 tracking-wider">
            PRINCECINEMA
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-2 lg:gap-4">
          <Link
            to="/"
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              isActive("/")
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Home
          </Link>
          <Link
            to="/favorites"
            className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
              isActive("/favorites")
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Favorites
            {favorites.length > 0 && (
              <span className="bg-amber-500 text-zinc-950 text-xs px-2 py-0.5 rounded-full font-bold">
                {favorites.length}
              </span>
            )}
          </Link>
          <Link
            to="/about"
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              isActive("/about")
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            About
          </Link>
          <Link
            to="/services"
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              isActive("/services")
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Services
          </Link>
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 hidden sm:inline">
                {user.email}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs text-white rounded-xl transition cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-xs font-bold text-zinc-950 rounded-xl transition cursor-pointer shadow-lg shadow-amber-500/20"
            >
              Sign In / Register
            </button>
          )}
        </div>
      </nav>

      {/* Auth Modal Popup */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}

export default NavBar;
