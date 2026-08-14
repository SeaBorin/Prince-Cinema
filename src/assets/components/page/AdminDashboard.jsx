import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const ROLE_COLORS = {
  customer: "#71717a",
  staff: "#38bdf8",
  manager: "#f59e0b",
  admin: "#fb7185",
};

function toDateSafe(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function formatDayLabel(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AdminDashboard() {
  const { user, role } = useAuth() || {};
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = role === "admin";

  useEffect(() => {
    if (!isAdmin) return;

    const unsubBookings = onSnapshot(collection(db, "bookings"), (snap) => {
      setBookings(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
    });

    return () => {
      unsubBookings();
      unsubUsers();
    };
  }, [isAdmin]);

  const metrics = useMemo(() => {
    const paidBookings = bookings.filter(
      (b) => b.status === "CONFIRMED" || b.status === "PAID",
    );

    const ticketBookings = paidBookings.filter((b) => b.type !== "food");
    const foodBookings = paidBookings.filter((b) => b.type === "food");

    const ticketRevenue = ticketBookings.reduce(
      (sum, b) => sum + (b.totalAmount || 0),
      0,
    );
    const foodRevenue = foodBookings.reduce(
      (sum, b) => sum + (b.totalAmount || 0),
      0,
    );
    const totalRevenue = ticketRevenue + foodRevenue;

    // Revenue by branch (tickets only — food orders aren't branch-scoped)
    const branchMap = {};
    ticketBookings.forEach((b) => {
      const branch = b.branch || "Unknown Branch";
      branchMap[branch] = (branchMap[branch] || 0) + (b.totalAmount || 0);
    });
    const revenueByBranch = Object.entries(branchMap)
      .map(([name, revenue]) => ({
        name: name.replace("Prince Cinema - ", ""),
        revenue: Number(revenue.toFixed(2)),
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Top 5 movies by revenue
    const movieMap = {};
    ticketBookings.forEach((b) => {
      const title = b.movieTitle || "Unknown";
      movieMap[title] = (movieMap[title] || 0) + (b.totalAmount || 0);
    });
    const topMovies = Object.entries(movieMap)
      .map(([name, revenue]) => ({ name, revenue: Number(revenue.toFixed(2)) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Revenue trend — last 7 days
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

      const dayTotal = paidBookings.reduce((sum, b) => {
        const created = toDateSafe(b.createdAt);
        if (created && created >= day && created < nextDay) {
          return sum + (b.totalAmount || 0);
        }
        return sum;
      }, 0);

      return {
        day: formatDayLabel(day),
        revenue: Number(dayTotal.toFixed(2)),
      };
    });

    // User growth — last 7 days (cumulative)
    let runningTotal = users.filter((u) => {
      const created = toDateSafe(u.createdAt);
      return created && created < last7Days[0];
    }).length;

    const userGrowth = last7Days.map((day) => {
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const newToday = users.filter((u) => {
        const created = toDateSafe(u.createdAt);
        return created && created >= day && created < nextDay;
      }).length;

      runningTotal += newToday;

      return { day: formatDayLabel(day), users: runningTotal };
    });

    // Role breakdown
    const roleCounts = { customer: 0, staff: 0, manager: 0, admin: 0 };
    users.forEach((u) => {
      const r = u.role || "customer";
      if (roleCounts[r] !== undefined) roleCounts[r]++;
    });
    const roleBreakdown = Object.entries(roleCounts)
      .filter(([, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));

    return {
      totalRevenue,
      ticketRevenue,
      foodRevenue,
      ticketCount: ticketBookings.length,
      foodCount: foodBookings.length,
      revenueByBranch,
      topMovies,
      revenueTrend,
      userGrowth,
      roleBreakdown,
      totalUsers: users.length,
    };
  }, [bookings, users]);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-zinc-950 text-white p-8 text-center">
        <div className="text-5xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold mb-2">Admin Sign-In Required</h2>
        <p className="text-zinc-400 max-w-md text-sm">
          Please sign in with an admin account to view the dashboard.
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-zinc-950 text-white p-8 text-center">
        <div className="text-5xl mb-4">⛔</div>
        <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
        <p className="text-zinc-400 max-w-md text-sm">
          This page is only available to administrators.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-zinc-950 text-white">
        <p className="text-xs text-zinc-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Platform-wide revenue, bookings, and user analytics.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
            Total Revenue
          </p>
          <p className="text-2xl font-black text-amber-500 mt-1">
            ${metrics.totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
            Ticket Sales
          </p>
          <p className="text-2xl font-black text-white mt-1">
            ${metrics.ticketRevenue.toFixed(2)}
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            {metrics.ticketCount} bookings
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
            Snack Sales
          </p>
          <p className="text-2xl font-black text-white mt-1">
            ${metrics.foodRevenue.toFixed(2)}
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            {metrics.foodCount} orders
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
            Total Users
          </p>
          <p className="text-2xl font-black text-white mt-1">
            {metrics.totalUsers}
          </p>
        </div>
      </div>

      {/* Revenue Trend */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white mb-4">
          Revenue — Last 7 Days
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
        {/* Revenue by Branch */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-white mb-4">
            Revenue by Branch
          </h2>
          {metrics.revenueByBranch.length === 0 ? (
            <p className="text-xs text-zinc-500">No ticket sales yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={metrics.revenueByBranch}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top 5 Movies */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-white mb-4">
            Top 5 Movies by Revenue
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-white mb-4">
            User Growth — Last 7 Days
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={metrics.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="day" stroke="#71717a" fontSize={11} />
              <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} />
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
                dataKey="users"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ fill: "#38bdf8", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Role Breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-sm font-bold text-white mb-4">User Roles</h2>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie
                  data={metrics.roleBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {metrics.roleBreakdown.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={ROLE_COLORS[entry.name] || "#71717a"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {metrics.roleBreakdown.map((entry) => (
                <div
                  key={entry.name}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-2 text-zinc-300 capitalize">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: ROLE_COLORS[entry.name] || "#71717a",
                      }}
                    />
                    {entry.name}
                  </span>
                  <span className="font-bold text-zinc-200">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
