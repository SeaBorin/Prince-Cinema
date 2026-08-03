import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { useAuth } from "./AuthContext";

const MovieContext = createContext();

export const useMovieContext = () => useContext(MovieContext);

export const MovieProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const { user } = useAuth();

  // Sync favorites from Firestore whenever the logged-in user changes
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }

    const userDocRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setFavorites(docSnap.data().favorites || []);
        } else {
          setFavorites([]);
        }
      },
      (error) => {
        console.error("Error fetching favorites from Firestore:", error);
      },
    );

    return () => unsubscribe();
  }, [user]);

  // Save updated favorites to Firestore under current user's UID
  const saveToFirestore = async (updatedFavorites) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        { favorites: updatedFavorites },
        { merge: true },
      );
    } catch (error) {
      console.error("Error saving favorites to Firestore:", error);
    }
  };

  const addToFavorites = (movie) => {
    if (!user) {
      alert("Please log in to save movies to your watchlist!");
      return;
    }

    if (!isFavorite(movie.id)) {
      const updated = [...favorites, movie];
      setFavorites(updated);
      saveToFirestore(updated);
    }
  };

  const removeFromFavorites = (movieId) => {
    if (!user) return;
    const updated = favorites.filter((m) => m.id !== movieId);
    setFavorites(updated);
    saveToFirestore(updated);
  };

  const isFavorite = (movieId) => {
    return favorites.some((m) => m.id === movieId);
  };

  return (
    <MovieContext.Provider
      value={{ favorites, addToFavorites, removeFromFavorites, isFavorite }}
    >
      {children}
    </MovieContext.Provider>
  );
};

export default MovieProvider;
