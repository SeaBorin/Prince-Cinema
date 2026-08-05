import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="w-full bg-zinc-950 border-t border-zinc-800/80 text-zinc-400 py-12 px-6 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand Info */}
        <div className="space-y-3 md:col-span-1">
          <span className="text-2xl font-black text-amber-500 tracking-wider">
            PRINCECINEMA
          </span>
          <p className="text-xs leading-relaxed text-zinc-500">
            A practical sophomore React JS, Tailwind CSS, and Firebase project.
            Stream movie trailers, manage watchlists, and explore trending
            cinema.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Navigation</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/" className="hover:text-amber-400 transition">
                Home
              </Link>
            </li>
            <li>
              <Link to="/favorites" className="hover:text-amber-400 transition">
                My Favorites
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-amber-400 transition">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-amber-400 transition">
                Services
              </Link>
            </li>
            <li>
              <Link to="/profile" className="hover:text-amber-400 transition">
                Profile
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal & Project Info */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">
            Academic Project
          </h4>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Built using TMDB Open API. Designed for educational purposes only.
          </p>
        </div>

        {/* Social Media Connections */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">
            Connect With Us
          </h4>
          <div className="flex flex-wrap gap-3">
            {/* Telegram */}
            <a
              href="https://t.me"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 bg-zinc-900 border border-zinc-800 hover:border-amber-500 hover:text-amber-400 rounded-xl flex items-center justify-center transition"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-2.03 9.56c-.15.68-.56.84-1.13.53l-3.11-2.29-1.5 1.44c-.17.17-.31.31-.63.31l.22-3.17 5.77-5.21c.25-.22-.05-.34-.39-.12l-7.14 4.5-3.07-.96c-.67-.21-.68-.67.14-.99l12.01-4.63c.56-.2 1.05.14.86.89z" />
              </svg>
            </a>
            {/* TikTok */}
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 bg-zinc-900 border border-zinc-800 hover:border-amber-500 hover:text-amber-400 rounded-xl flex items-center justify-center transition"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.56-1.31 1.56-1.28 2.56.02.82.41 1.62 1.05 2.13.78.63 1.84.83 2.82.55 1.07-.3 1.88-1.22 2.07-2.31.08-.63.07-1.27.07-1.91V.02z" />
              </svg>
            </a>
            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 bg-zinc-900 border border-zinc-800 hover:border-amber-500 hover:text-amber-400 rounded-xl flex items-center justify-center transition"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 bg-zinc-900 border border-zinc-800 hover:border-amber-500 hover:text-amber-400 rounded-xl flex items-center justify-center transition"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            {/* Messenger */}
            <a
              href="https://m.me"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 bg-zinc-900 border border-zinc-800 hover:border-amber-500 hover:text-amber-400 rounded-xl flex items-center justify-center transition"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.082.3 2.23.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26 6.559-6.963 3.13 3.259 5.889-3.259-6.56 6.964z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-zinc-900 text-center text-xs text-zinc-600">
        © 2026 CINEMA Platform. All rights reserved. Developed for Sophomore
        React Project.
      </div>
    </footer>
  );
}

export default Footer;
