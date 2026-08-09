import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { auth, sendPasswordResetEmail } from "../../firebase";

const GMAIL_REGEX = /^[^\s@]+@gmail\.com$/i;

function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState("login"); // "login" | "register" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login, signup } = useAuth() || {};

  if (!isOpen) return null;

  const resetLocalState = () => {
    setError("");
    setResetSent(false);
  };

  const switchMode = (nextMode) => {
    resetLocalState();
    setMode(nextMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "register" && !GMAIL_REGEX.test(email.trim())) {
      setError("Please register using a valid @gmail.com email address.");
      return;
    }

    try {
      if (mode === "register") {
        if (signup) await signup(email, password);
      } else {
        if (login) await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setSubmitting(false);
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
          {mode === "register"
            ? "Create Account"
            : mode === "reset"
              ? "Reset Password"
              : "Welcome Back"}
        </h2>

        {error && (
          <div className="mb-4 text-xs bg-red-950/60 border border-red-800 text-red-400 p-3 rounded-lg">
            {error}
          </div>
        )}

        {mode === "reset" ? (
          resetSent ? (
            <div className="space-y-4">
              <div className="text-xs bg-emerald-950/50 border border-emerald-800 text-emerald-400 p-4 rounded-xl text-center">
                A password reset link has been sent to{" "}
                <span className="font-semibold text-emerald-300">{email}</span>.
                Check your inbox (and spam folder) to set a new password.
              </div>
              <button
                onClick={() => switchMode("login")}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-sm transition cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-xs text-zinc-400 -mt-2 mb-2">
                Enter the email address linked to your account and we'll send
                you a link to reset your password.
              </p>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Sending..." : "Send Reset Link"}
              </button>

              <button
                type="button"
                onClick={() => switchMode("login")}
                className="w-full text-center text-xs text-zinc-400 hover:text-white transition"
              >
                ← Back to Sign In
              </button>
            </form>
          )
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {mode === "register" && (
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Must be a valid @gmail.com address — we'll send a
                    verification link to confirm it's yours.
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-zinc-400">Password</label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => switchMode("reset")}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-medium"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
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
                {mode === "register" ? "Register Account" : "Sign In"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-zinc-400">
              {mode === "register"
                ? "Already have an account?"
                : "Don't have an account?"}{" "}
              <button
                onClick={() =>
                  switchMode(mode === "register" ? "login" : "register")
                }
                className="text-amber-400 font-semibold underline ml-1"
              >
                {mode === "register" ? "Sign In" : "Register"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
