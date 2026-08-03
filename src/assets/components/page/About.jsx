import React from "react";

function About() {
  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-12 text-zinc-100">
      <div className="space-y-6 text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold text-white">About CINEMA</h1>
        <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
          A full-stack client web application created as a sophomore coursework
          project showcasing Modern Frontend Architecture, API integrations, and
          Cloud Authentication.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
        <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-amber-500 mb-2">React JS</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Built using component-based architecture, React Context API, custom
            hooks, and React Router DOM v6.
          </p>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-amber-500 mb-2">
            Tailwind CSS
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Styled with modern dark-mode utility classes, responsive grid
            systems, and glassmorphism UI overlays.
          </p>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-amber-500 mb-2">
            Firebase Cloud
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Secured with Firebase Authentication and Cloud Firestore for storing
            real-time user profiles and favorites.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
