import React, { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { db } from "../../../firebase";
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import TicketModal from "../TicketModal";

// Dynamic ticket state helper
function getTicketStatus(bookingItem, currentTime) {
  let showtimeDate;

  if (bookingItem.showtimeTimestamp) {
    showtimeDate = new Date(bookingItem.showtimeTimestamp);
  } else {
    // Fallback parser if showtimeTimestamp wasn't provided in old records
    showtimeDate = new Date();
    if (bookingItem.showtime) {
      const [h, m] = bookingItem.showtime.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        showtimeDate.setHours(h, m, 0, 0);
      }
    }
  }

  const expireDate = new Date(showtimeDate.getTime() + 2 * 60 * 60 * 1000); // Showtime + 2 Hours
  const diffToStart = showtimeDate.getTime() - currentTime.getTime();
  const diffToEnd = expireDate.getTime() - currentTime.getTime();

  // 1. Expired (More than 2 hours late)
  if (diffToEnd <= 0) {
    return {
      status: "EXPIRED",
      isExpired: true,
      badgeStyle: "bg-rose-500/20 text-rose-400 border border-rose-500/40",
      label: "EXPIRED PASS",
      countdownText: "Show ended",
    };
  }

  // 2. Movie is Currently Playing (Within 2 hours of showtime)
  if (diffToStart <= 0 && diffToEnd > 0) {
    const minsLeft = Math.floor(diffToEnd / (1000 * 60));
    return {
      status: "IN_PROGRESS",
      isExpired: false,
      badgeStyle:
        "bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse",
      label: "MOVIE IN PROGRESS",
      countdownText: `Ends in ${Math.floor(minsLeft / 60)}h ${minsLeft % 60}m`,
    };
  }

  // 3. Upcoming (Count down timer to showtime)
  const hours = Math.floor(diffToStart / (1000 * 60 * 60));
  const mins = Math.floor((diffToStart % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diffToStart % (1000 * 60)) / 1000);

  const formattedCountdown = `${hours.toString().padStart(2, "0")}h ${mins
    .toString()
    .padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;

  return {
    status: "UPCOMING",
    isExpired: false,
    badgeStyle:
      "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    label: "VALID PASS",
    countdownText: `Starts in ${formattedCountdown}`,
  };
}

function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("tickets"); // 'tickets' | 'favorites' | 'history'
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Clock tick every 1 second for live countdown timer
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;

    // 1. Fetch User Booking History (Real-time)
    const bookingsRef = collection(db, "users", user.uid, "bookings");
    const q = query(bookingsRef, orderBy("createdAt", "desc"));

    const unsubscribeBookings = onSnapshot(
      q,
      (snapshot) => {
        const history = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBookings(history);
        setLoading(false);
      },
      () => {
        // Fallback without ordering if index is building
        onSnapshot(bookingsRef, (snap) => {
          setBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          setLoading(false);
        });
      },
    );

    // 2. Fetch User Favorites (Real-time)
    const userDocRef = doc(db, "users", user.uid);
    const unsubscribeFavorites = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        setFavorites(snapshot.data().favorites || []);
      }
    });

    return () => {
      unsubscribeBookings();
      unsubscribeFavorites();
    };
  }, [user]);

  // Separate active/valid tickets from expired history tickets
  const activeTickets = bookings.filter(
    (item) => !getTicketStatus(item, now).isExpired,
  );
  const historyTickets = bookings.filter(
    (item) => getTicketStatus(item, now).isExpired,
  );

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-zinc-950 text-white p-8 text-center">
        <div className="text-5xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
        <p className="text-zinc-400 max-w-md text-sm">
          Please sign in to view your profile, active tickets, and order
          history.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 max-w-5xl mx-auto">
      {/* Profile Header Card */}
      <div className="flex items-center gap-4 p-6 bg-zinc-900/80 border border-zinc-800 rounded-2xl mb-8">
        <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center text-zinc-950 font-black text-2xl shadow-lg shadow-amber-500/20">
          {user.email ? user.email[0].toUpperCase() : "U"}
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-white">
            {user.displayName || "Movie Fan"}
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">{user.email}</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-6 border-b border-zinc-800 mb-6">
        <button
          onClick={() => setActiveTab("tickets")}
          className={`pb-3 text-sm font-semibold transition relative ${
            activeTab === "tickets"
              ? "text-amber-500 border-b-2 border-amber-500"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          My Tickets ({activeTickets.length})
        </button>
        <button
          onClick={() => setActiveTab("favorites")}
          className={`pb-3 text-sm font-semibold transition relative ${
            activeTab === "favorites"
              ? "text-amber-500 border-b-2 border-amber-500"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Saved Favorites ({favorites.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 text-sm font-semibold transition relative ${
            activeTab === "history"
              ? "text-amber-500 border-b-2 border-amber-500"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          History ({historyTickets.length})
        </button>
      </div>

      {/* Tab 1: Active Tickets */}
      {activeTab === "tickets" && (
        <div className="space-y-4">
          {loading ? (
            <p className="text-xs text-zinc-500">Loading tickets...</p>
          ) : activeTickets.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
              <p className="text-zinc-400 text-sm">No active tickets found.</p>
            </div>
          ) : (
            activeTickets.map((item) => {
              const statusInfo = getTicketStatus(item, now);

              return (
                <div
                  key={item.id}
                  className="p-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-zinc-700 transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-md font-mono font-semibold">
                        #{item.bookingId || item.id.slice(0, 8)}
                      </span>

                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${statusInfo.badgeStyle}`}
                      >
                        {statusInfo.label}
                      </span>

                      <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-md border border-zinc-700/60 flex items-center gap-1">
                        ⏱️ {statusInfo.countdownText}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-white">
                      {item.movieTitle}
                    </h3>

                    <p className="text-xs text-zinc-400">
                      {item.branch || "Prince Cinema"} • {item.format || "2D"} •{" "}
                      <span className="text-amber-400 font-semibold">
                        {item.date ? `${item.date}, ` : ""}
                        {item.showtime}
                      </span>
                    </p>

                    <p className="text-xs text-zinc-300">
                      Seats:{" "}
                      <span className="font-mono text-amber-400 font-bold">
                        {item.seats?.join(", ")}
                      </span>
                    </p>
                  </div>

                  <div className="text-right w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 border-zinc-800 pt-3 sm:pt-0 gap-3">
                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase tracking-wider">
                        Total Paid
                      </span>
                      <span className="text-lg font-black text-amber-400">
                        $
                        {item.totalAmount
                          ? item.totalAmount.toFixed(2)
                          : "0.00"}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedTicket(item)}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow-lg shadow-amber-500/20 transition"
                    >
                      View Ticket Pass
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Saved Favorites */}
      {activeTab === "favorites" && (
        <div>
          {favorites.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
              <p className="text-zinc-400 text-sm">
                No favorite movies saved yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {favorites.map((fav) => (
                <div
                  key={fav.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden p-2 group hover:border-amber-500/50 transition"
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w500${fav.poster_path}`}
                    alt={fav.title}
                    className="w-full h-52 object-cover rounded-lg mb-2 group-hover:scale-105 transition duration-300"
                  />
                  <h4 className="text-xs font-bold text-white truncate px-1">
                    {fav.title}
                  </h4>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Expired Ticket History */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {loading ? (
            <p className="text-xs text-zinc-500">Loading history...</p>
          ) : historyTickets.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
              <p className="text-zinc-400 text-sm">
                No expired ticket history.
              </p>
            </div>
          ) : (
            historyTickets.map((item) => {
              const statusInfo = getTicketStatus(item, now);

              return (
                <div
                  key={item.id}
                  className="p-5 bg-zinc-900/50 border border-rose-950/40 opacity-75 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-zinc-700 transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-md font-mono font-semibold">
                        #{item.bookingId || item.id.slice(0, 8)}
                      </span>

                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${statusInfo.badgeStyle}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-white line-through text-zinc-400">
                      {item.movieTitle}
                    </h3>

                    <p className="text-xs text-zinc-400">
                      {item.branch || "Prince Cinema"} • {item.format || "2D"} •{" "}
                      <span className="text-zinc-400">
                        {item.date ? `${item.date}, ` : ""}
                        {item.showtime}
                      </span>
                    </p>

                    <p className="text-xs text-zinc-400">
                      Seats:{" "}
                      <span className="font-mono font-bold text-zinc-300">
                        {item.seats?.join(", ")}
                      </span>
                    </p>
                  </div>

                  <div className="text-right w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 border-zinc-800 pt-3 sm:pt-0 gap-3">
                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase tracking-wider">
                        Total Paid
                      </span>
                      <span className="text-lg font-black text-zinc-400">
                        $
                        {item.totalAmount
                          ? item.totalAmount.toFixed(2)
                          : "0.00"}
                      </span>
                    </div>

                    <button
                      disabled
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700/40"
                    >
                      Pass Expired
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Ticket Pass Modal */}
      {selectedTicket && (
        <TicketModal
          booking={selectedTicket}
          isOpen={Boolean(selectedTicket)}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}

export default Profile;
