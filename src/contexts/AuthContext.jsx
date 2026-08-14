import React, { createContext, useContext, useEffect, useState } from "react";
import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const snapshot = await getDoc(userDocRef);

          if (!snapshot.exists()) {
            await setDoc(userDocRef, {
              email: currentUser.email,
              role: "customer",
              createdAt: serverTimestamp(),
            });
          } else if (!snapshot.data().email && currentUser.email) {
            await setDoc(
              userDocRef,
              { email: currentUser.email },
              { merge: true },
            );
          }
        } catch (err) {
          console.error("Error backfilling user profile:", err);
        }
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setBranch(null);
      return;
    }
    const userDocRef = doc(db, "users", user.uid);
    const unsubscribeProfile = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setRole(data.role || "customer");
        setBranch(data.branch || null);
      } else {
        setRole("customer");
        setBranch(null);
      }
    });
    return () => unsubscribeProfile();
  }, [user]);

  const signup = async (email, password) => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    if (credential?.user) {
      await sendEmailVerification(credential.user);

      await setDoc(doc(db, "users", credential.user.uid), {
        email: credential.user.email,
        role: "customer",
        createdAt: serverTimestamp(),
      });
    }

    return credential;
  };

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  const resendVerificationEmail = () => {
    if (auth.currentUser) {
      return sendEmailVerification(auth.currentUser);
    }
    return Promise.reject(new Error("No signed-in user."));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        branch,
        signup,
        login,
        logout,
        resendVerificationEmail,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
