import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { CAMBODIA_BRANCHES } from "../../../data/cinemaData.js";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function toDateSafe(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function formatDayLabel(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ManagerDashboard() {
  const { user, role, branch: myBranch } = useAuth() || {};
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranchId, setSelectedBranchId] = useState(null);

  const isManager = role === "manager";
  const isAdmin = role === "admin";
  const hasAccess = isManager || isAdmin;

  // Managers are locked to their assigned branch; admins previewing this
  // page can pick any branch from a dropdown
  useEffect(() => {
    if (isManager) {
      setSelectedBranchId(myBranch || null);
    } else if (isAdmin && !selectedBranchId) {
      setSelectedBranchId(CAMBODIA_BRANCHES[0]?.id || null);
    }
  }, [isManager, isAdmin, myBranch, selectedBranchId]);

  useEffect(() => {
    if (!hasAccess) return;
    const unsubscribe = onSnapshot(collection(db, "bookings"), (snap) => {
      setBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [hasAccess]);

  const activeBranch = CAMBODIA_BRANCHES.find((b) => b.id === selectedBranchId);

  const metrics = useMemo(() => {
    if (!activeBranch) return null;

    const branchBookings = bookings.filter(
      (b) =>
        b.type !== "food" &&
        (b.status === "CONFIRMED" || b.status === "PAID") &&
        b.branch === activeBranch.name,
    );

    const totalRevenue = branchBookings.reduce(
      (sum, b) => sum + (b.totalAmount || 0),
      0,
    );
    const totalSeats = branchBookings.reduce(
      (sum, b) => sum + (b.seats?.length || 0),
      0,
    );

    const movieMap = {};
    branchBookings.forEach((b) => {
      const title = b.movieTitle || "Unknown";
      movieMap[title] = (movieMap[title] || 0) + (b.totalAmount || 0);
    });
    const topMovies = Object.entries(movieMap)
      .map(([name, revenue]) => ({ name, revenue: Number(revenue.toFixed(2)) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const today = new Date();
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const revenueTrend = last7Days.map((day) => {
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayTotal = branchBookings.reduce((sum, b) => {
        const created = toDateSafe(b.createdAt);
        if (created && created >= day && created < nextDay) {
          return sum + (b.totalAmount || 0);
        }
        return sum;
      }, 0);

      return { day: formatDayLabel(day), revenue: Number(dayTotal.toFixed(2)) };
    });

    const hallCounts = {};
    branchBookings.forEach((b) => {
      const hall = b.hall || "Unassigned";
      hallCounts[hall] = (hallCounts[hall] || 0) + 1;
    });

    return {
      totalRevenue,
      totalSeats,
      bookingCount: branchBookings.length,
      topMovies,
      revenueTrend,
      hallCounts,
    };
  }, [bookings, activeBranch]);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-zinc-950 text-white p-8 text-center">
        <div className="text-5xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold mb-2">Sign-In Required</h2>
        <p className="text-zinc-400 max-w-md text-sm">
          Please sign in with a manager account to view this dashboard.
        </p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-zinc-950 text-white p-8 text-center">
        <div className="text-5xl mb-4">⛔</div>
        <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
        <p className="text-zinc-400 max-w-md text-sm">
          This page is only available to branch managers.
        </p>
      </div>
    );
  }

  if (isManager && !myBranch) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-zinc-950 text-white p-8 text-center">
        <div className="text-5xl mb-4">🏢</div>
        <h2 className="text-2xl font-bold mb-2">No Branch Assigned</h2>
        <p className="text-zinc-400 max-w-md text-sm">
          Your account hasn't been assigned to a branch yet. Please contact an
          administrator.
        </p>
      </div>
    );
  }

  if (loading || !metrics) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-zinc-950 text-white">
        <p className="text-xs text-zinc-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Branch Dashboard</h1>
          <p className="text-xs text-zinc-400 mt-1">
            {activeBranch?.name} — {activeBranch?.location}
          </p>
        </div>

        {isAdmin && (
          <select
            value={selectedBranchId || ""}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
          >
            {CAMBODIA_BRANCHES.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
            Branch Revenue
          </p>
          <p className="text-2xl font-black text-amber-500 mt-1">
            ${metrics.totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
            Tickets Sold
          </p>
          <p className="text-2xl font-black text-white mt-1">
            {metrics.bookingCount}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
            Seats Booked
          </p>
          <p className="text-2xl font-black text-white mt-1">
            {metrics.totalSeats}
          </p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white mb-4">
          Branch Revenue — Last 7 Days
        </h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={metrics.revenueTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="day" stroke="#71717a" fontSize={11} />
            <YAxis stroke="#71717a" fontSize={11} />
            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: "#f59e0b", r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-white mb-4">
            Top Movies at This Branch
          </h2>
          {metrics.topMovies.length === 0 ? (
            <p className="text-xs text-zinc-500">No ticket sales yet.</p>
          ) : (
            <div className="space-y-3">
              {metrics.topMovies.map((movie, index) => (
                <div key={movie.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-500 w-4">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-200 truncate pr-2">
                        {movie.name}
                      </span>
                      <span className="text-amber-400 font-bold shrink-0">
                        ${movie.revenue.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{
                          width: `${
                            (movie.revenue / metrics.topMovies[0].revenue) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-white mb-4">
            Bookings by Hall
          </h2>
          {Object.keys(metrics.hallCounts).length === 0 ? (
            <p className="text-xs text-zinc-500">No ticket sales yet.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(metrics.hallCounts).map(([hall, count]) => (
                <div
                  key={hall}
                  className="flex justify-between items-center text-xs bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2"
                >
                  <span className="text-zinc-300">{hall}</span>
                  <span className="font-bold text-amber-400">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
