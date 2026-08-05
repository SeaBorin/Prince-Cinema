import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { auth } from "../../firebase";

// Import your custom logo image
import logoImg from "../../assets/prince-cinema-img.png";

export default function NavBar({ onOpenAuthModal }) {
  const authContext = useAuth() || {};

  // Handles both 'currentUser' or 'user' naming conventions in AuthContext
  const contextUser = authContext.currentUser || authContext.user;

  // Local state as a safety fallback linked directly to Firebase Auth
  const [firebaseUser, setFirebaseUser] = useState(auth?.currentUser || null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Listen directly to Firebase Auth state changes as a backup trigger
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Active user (prioritizes Context, falls back to direct Firebase instance)
  const activeUser = contextUser || firebaseUser;

  const handleLogout = async () => {
    try {
      if (authContext.logout) {
        await authContext.logout();
      } else if (authContext.signOut) {
        await authContext.signOut();
      } else if (auth) {
        await auth.signOut();
      }
      navigate("/");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Favorites", path: "/favorites" },
    { name: "Services", path: "/services" },
    { name: "About", path: "/about" },
    { name: "Profile", path: "/profile" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand / Custom Logo */}
        <Link to="/" className="flex items-center group">
          <img
            src={logoImg}
            alt="Prince Cinema Logo"
            className="h-10 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-900/60 p-1.5 rounded-full border border-zinc-800/60">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                isActive(link.path)
                  ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 font-semibold"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Dynamic Auth Button Area (Sign In vs Sign Out) */}
        <div className="hidden md:flex items-center gap-4">
          {activeUser ? (
            <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 p-1.5 pl-4 rounded-full">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-2 max-w-[180px] truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
                {activeUser.email || activeUser.displayName || "User"}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-xs font-bold rounded-full bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/10"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all duration-300"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-zinc-800 px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl text-base font-medium ${
                isActive(link.path)
                  ? "bg-amber-500 text-zinc-950 font-semibold"
                  : "text-zinc-300 hover:bg-zinc-900"
              }`}
            >
              {link.name}
            </Link>
          ))}

          <div className="pt-4 border-t border-zinc-800">
            {activeUser ? (
              <div className="space-y-3">
                <p className="px-4 text-xs font-semibold text-zinc-400 truncate">
                  Signed in as:{" "}
                  <span className="text-amber-400">{activeUser.email}</span>
                </p>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-xl bg-amber-500 text-zinc-950 font-bold text-center"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="w-full py-3 rounded-xl bg-amber-500 text-zinc-950 font-bold text-center"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
