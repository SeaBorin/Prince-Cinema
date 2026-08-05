import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

function AuthModal({ isOpen, onClose }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Safe destructuring prevents white screen crashes
  const { login, signup, loginWithGoogle } = useAuth() || {};

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegister) {
        if (signup) await signup(email, password);
      } else {
        if (login) await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      if (loginWithGoogle) await loginWithGoogle();
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">
          {isRegister ? "Create Account" : "Welcome Back"}
        </h2>

        {error && (
          <div className="mb-4 text-xs bg-red-950/60 border border-red-800 text-red-400 p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-sm transition cursor-pointer"
          >
            {isRegister ? "Register Account" : "Sign In"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-zinc-800"></div>
          <span className="text-xs text-zinc-500">OR</span>
          <div className="flex-1 h-px bg-zinc-800"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition cursor-pointer"
        >
          Google Sign-In
        </button>

        <p className="mt-6 text-center text-xs text-zinc-400">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-amber-400 font-semibold underline ml-1"
          >
            {isRegister ? "Sign In" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthModal;
