import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { auth } from "../../firebase";

import logoImg from "../prince-cinema-img.png";

export default function NavBar({ onOpenAuthModal }) {
  const authContext = useAuth() || {};

  const contextUser = authContext.currentUser || authContext.user;
  const role = authContext.role;
  const [firebaseUser, setFirebaseUser] = useState(auth?.currentUser || null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const accountRef = useRef(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsAccountOpen(false);
    setIsMenuOpen(false);
  }, [location.pathname]);

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
    { name: "Food & Snacks", path: "/foods" },
    { name: "Favorites", path: "/favorites" },
    { name: "Services", path: "/services" },
    { name: "About", path: "/about" },
  ];

  const isStaffRole =
    role === "staff" || role === "manager" || role === "admin";
  const isManagerRole = role === "manager" || role === "admin";
  const isAdminRole = role === "admin";

  const accountLinks = [
    { name: "Profile", path: "/profile", icon: "👤" },
    ...(isStaffRole
      ? [{ name: "Staff Check-In", path: "/staff-checkin", icon: "🎟️" }]
      : []),
    ...(isManagerRole
      ? [{ name: "Branch Dashboard", path: "/manager-dashboard", icon: "🏢" }]
      : []),
    ...(isAdminRole
      ? [
          { name: "Dashboard", path: "/admin-dashboard", icon: "📊" },
          { name: "Manage Users", path: "/admin-users", icon: "⚙️" },
          { name: "Manage Food Menu", path: "/admin-food", icon: "🍿" },
        ]
      : []),
  ];

  const isActive = (path) => location.pathname === path;

  const initials = activeUser?.email ? activeUser.email[0].toUpperCase() : "U";

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center group">
          <img
            src={logoImg}
            alt="Prince Cinema Logo"
            className="h-10 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-1 bg-zinc-900/60 p-1.5 rounded-full border border-zinc-800/60">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                isActive(link.path)
                  ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 font-semibold"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {activeUser ? (
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => setIsAccountOpen((prev) => !prev)}
                className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-1.5 pl-2 rounded-full transition cursor-pointer"
              >
                <span className="w-8 h-8 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center text-xs font-black shrink-0">
                  {initials}
                </span>
                <span className="text-xs font-semibold text-zinc-300 max-w-[140px] truncate">
                  {activeUser.email || activeUser.displayName || "User"}
                </span>
                {role && role !== "customer" && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold uppercase tracking-wide shrink-0">
                    {role}
                  </span>
                )}
                <svg
                  className={`w-3.5 h-3.5 text-zinc-500 mr-1.5 transition-transform duration-200 ${
                    isAccountOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isAccountOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden py-2 z-50">
                  <div className="px-4 py-2 border-b border-zinc-800 mb-1">
                    <p className="text-xs font-semibold text-zinc-200 truncate">
                      {activeUser.email}
                    </p>
                    {role && (
                      <span
                        className={`inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                          role === "admin"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : role === "manager"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : role === "staff"
                                ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                                : "bg-zinc-700/40 text-zinc-400 border border-zinc-600/40"
                        }`}
                      >
                        {role}
                      </span>
                    )}
                  </div>

                  {accountLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition ${
                        isActive(link.path)
                          ? "bg-amber-500/10 text-amber-400"
                          : "text-zinc-300 hover:bg-zinc-800/70 hover:text-white"
                      }`}
                    >
                      <span>{link.icon}</span>
                      {link.name}
                    </Link>
                  ))}

                  <div className="border-t border-zinc-800 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    >
                      <span>🚪</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 cursor-pointer"
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

          {activeUser && accountLinks.length > 0 && (
            <>
              <div className="pt-2 border-t border-zinc-800" />
              {accountLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-base font-medium ${
                    isActive(link.path)
                      ? "bg-amber-500 text-zinc-950 font-semibold"
                      : "text-zinc-300 hover:bg-zinc-900"
                  }`}
                >
                  <span>{link.icon}</span>
                  {link.name}
                </Link>
              ))}
            </>
          )}

          <div className="pt-4 border-t border-zinc-800">
            {activeUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-4">
                  <span className="w-8 h-8 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center text-xs font-black shrink-0">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 truncate">
                      {activeUser.email}
                    </p>
                    {role && role !== "customer" && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold uppercase tracking-wide">
                        {role}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-3 rounded-xl bg-amber-500 text-zinc-950 font-bold text-center cursor-pointer"
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
                className="w-full py-3 rounded-xl bg-amber-500 text-zinc-950 font-bold text-center cursor-pointer"
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
