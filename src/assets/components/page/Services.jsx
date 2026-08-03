import React from "react";

function Services() {
  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-12 text-zinc-100">
      <div className="space-y-4 text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold text-white">
          Platform Features
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base">
          Everything provided within our movie discovery streaming application.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl space-y-3 hover:border-amber-500/50 transition duration-300">
          <div className="text-3xl text-amber-500">🎬</div>
          <h3 className="text-lg font-bold text-white">
            High-Definition Trailers
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Stream official trailers directly through embedded YouTube players
            without leaving the web application.
          </p>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl space-y-3 hover:border-amber-500/50 transition duration-300">
          <div className="text-3xl text-amber-500">🔍</div>
          <h3 className="text-lg font-bold text-white">Real-Time Search</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Query thousands of titles instantly via the TMDB Search API with
            optimized asynchronous fetching.
          </p>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl space-y-3 hover:border-amber-500/50 transition duration-300">
          <div className="text-3xl text-amber-500">♥</div>
          <h3 className="text-lg font-bold text-white">Cloud Watchlist Sync</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Save and sync your favorite movies across multiple devices under
            your registered account.
          </p>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl space-y-3 hover:border-amber-500/50 transition duration-300">
          <div className="text-3xl text-amber-500">🔒</div>
          <h3 className="text-lg font-bold text-white">
            Firebase Account Security
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Secure user authentication powered by Firebase Auth, supporting
            standard email sign-ups and OAuth Google sign-ins.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Services;
