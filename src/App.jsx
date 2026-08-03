import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./assets/components/page/Home.jsx";
import Favorites from "./assets/components/page/Favorites.jsx";
import About from "./assets/components/page/About.jsx";
import Services from "./assets/components/page/Services.jsx";
import NavBar from "./assets/components/NavBar.jsx";
import Footer from "./assets/components/Footer.jsx";
import MovieProvider from "./contexts/MovieContext.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";

function App() {
  return (
    <AuthProvider>
      <MovieProvider>
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-zinc-950">
          <NavBar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </MovieProvider>
    </AuthProvider>
  );
}

export default App;
