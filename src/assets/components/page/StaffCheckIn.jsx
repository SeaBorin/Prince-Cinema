import React, { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { db } from "../../../firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

function computeTicketValidity(item) {
  if (item.checkedIn) {
    return { valid: false, reason: "This ticket has already been checked in." };
  }

  let showtimeDate;
  if (item.showtimeTimestamp) {
    showtimeDate = new Date(item.showtimeTimestamp);
  } else {
    showtimeDate = new Date();
    if (item.showtime) {
      const [h, m] = item.showtime.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) showtimeDate.setHours(h, m, 0, 0);
    }
  }

  const expireDate = new Date(showtimeDate.getTime() + 2 * 60 * 60 * 1000);

  if (new Date() > expireDate) {
    return { valid: false, reason: "This ticket has expired." };
  }

  return { valid: true, reason: null };
}

export default function StaffCheckIn() {
  const { user, role } = useAuth() || {};
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const isAuthorized =
    role === "staff" || role === "manager" || role === "admin";

  const handleLookup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setResult(null);

    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) {
      setError("Please enter a booking or order code.");
      return;
    }

    setLoading(true);
    try {
      const bookingRef = doc(db, "bookings", trimmedCode);
      const snapshot = await getDoc(bookingRef);

      if (!snapshot.exists()) {
        setError("No booking or order found with that code.");
        return;
      }

      setResult({ id: snapshot.id, ...snapshot.data() });
    } catch (err) {
      console.error(err);
      setError("Something went wrong looking up that code.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!result) return;
    setActionLoading(true);
    setError("");

    try {
      const bookingRef = doc(db, "bookings", result.id);
      const isFood = result.type === "food";

      if (isFood) {
        await updateDoc(bookingRef, {
          pickedUp: true,
          pickedUpAt: serverTimestamp(),
        });
        setSuccessMsg(`Order ${result.id} marked as picked up.`);
      } else {
        await updateDoc(bookingRef, {
          checkedIn: true,
          checkedInAt: serverTimestamp(),
        });
        setSuccessMsg(`Ticket ${result.id} checked in.`);
      }

      setResult((prev) => ({
        ...prev,
        pickedUp: isFood ? true : prev.pickedUp,
        checkedIn: !isFood ? true : prev.checkedIn,
      }));
    } catch (err) {
      console.error(err);
      setError("Failed to update this record. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-zinc-950 text-white p-8 text-center">
        <div className="text-5xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold mb-2">Staff Sign-In Required</h2>
        <p className="text-zinc-400 max-w-md text-sm">
          Please sign in with a staff account to access check-in.
        </p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-zinc-950 text-white p-8 text-center">
        <div className="text-5xl mb-4">⛔</div>
        <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
        <p className="text-zinc-400 max-w-md text-sm">
          This page is only available to cinema staff. If you believe you should
          have access, contact an administrator to update your account role.
        </p>
      </div>
    );
  }

  const isFoodResult = result?.type === "food";
  const validity =
    result && !isFoodResult ? computeTicketValidity(result) : null;
  const alreadyPickedUp = result && isFoodResult && result.pickedUp;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Staff Check-In</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Enter a ticket or snack order code to validate and check it in.
        </p>
      </div>

      <form onSubmit={handleLookup} className="flex gap-3">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. SNACK-FWEB9BD or ticket code"
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-amber-500 text-white uppercase"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-sm transition disabled:opacity-50"
        >
          {loading ? "Looking up..." : "Look Up"}
        </button>
      </form>

      {error && (
        <div className="text-xs bg-red-950/60 border border-red-800 text-red-400 p-3 rounded-lg">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="text-xs bg-emerald-950/50 border border-emerald-800 text-emerald-400 p-3 rounded-lg">
          {successMsg}
        </div>
      )}

      {result && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-amber-400 font-bold">
              #{result.id}
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700">
              {isFoodResult ? "Snack Order" : "Movie Ticket"}
            </span>
          </div>

          {isFoodResult ? (
            <div className="space-y-1">
              {result.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="text-zinc-300">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-zinc-400">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1 text-xs text-zinc-300">
              <p className="text-base font-bold text-white">
                {result.movieTitle}
              </p>
              <p>
                {result.branch} • {result.date}, {result.showtime}
              </p>
              <p>
                Seats:{" "}
                <span className="font-mono text-amber-400 font-bold">
                  {result.seats?.join(", ")}
                </span>
              </p>
            </div>
          )}

          <div className="border-t border-zinc-800 pt-3 flex justify-between items-baseline">
            <span className="text-xs text-zinc-400">Total Paid</span>
            <span className="text-lg font-black text-amber-500">
              ${result.totalAmount?.toFixed(2)}
            </span>
          </div>

          {isFoodResult ? (
            alreadyPickedUp ? (
              <div className="text-xs bg-zinc-800 text-zinc-400 p-3 rounded-lg text-center">
                Already picked up.
              </div>
            ) : (
              <button
                onClick={handleConfirmAction}
                disabled={actionLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : "Mark as Picked Up"}
              </button>
            )
          ) : validity?.valid ? (
            <button
              onClick={handleConfirmAction}
              disabled={actionLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition disabled:opacity-50"
            >
              {actionLoading ? "Processing..." : "Check In Ticket"}
            </button>
          ) : (
            <div className="text-xs bg-rose-950/50 border border-rose-800 text-rose-400 p-3 rounded-lg text-center">
              {validity?.reason || "This ticket is not valid for check-in."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
