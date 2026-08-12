import React, { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";

const ROLE_OPTIONS = ["customer", "staff", "manager", "admin"];

const ROLE_BADGE_STYLE = {
  customer: "bg-zinc-700/40 text-zinc-400 border border-zinc-600/40",
  staff: "bg-sky-500/20 text-sky-400 border border-sky-500/30",
  manager: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  admin: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
};

export default function AdminUsers() {
  const { user, role } = useAuth() || {};
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingUid, setSavingUid] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isAdmin = role === "admin";

  useEffect(() => {
    if (!isAdmin) return;

    // No orderBy here on purpose — Firestore's orderBy silently EXCLUDES
    // any document missing that field, which hid every account created
    // before "createdAt" existed on user docs. We sort client-side instead.
    const usersRef = collection(db, "users");

    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const list = snapshot.docs.map((d) => ({ uid: d.id, ...d.data() }));

      list.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });

      setUsers(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const handleRoleChange = async (targetUid, newRole) => {
    setError("");
    setSuccessMsg("");

    if (targetUid === user?.uid && newRole !== "admin") {
      const confirmSelfDemote = window.confirm(
        "You're about to remove your own admin access. You will lose access to this page immediately. Continue?",
      );
      if (!confirmSelfDemote) return;
    }

    setSavingUid(targetUid);
    try {
      const { doc, updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(db, "users", targetUid), { role: newRole });
      setSuccessMsg(`Role updated to "${newRole}".`);
    } catch (err) {
      console.error(err);
      setError("Failed to update role. Please try again.");
    } finally {
      setSavingUid(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-zinc-950 text-white p-8 text-center">
        <div className="text-5xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold mb-2">Admin Sign-In Required</h2>
        <p className="text-zinc-400 max-w-md text-sm">
          Please sign in with an admin account to manage users.
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Manage Users</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Promote or demote accounts between Customer, Staff, Manager, and
          Admin.
        </p>
      </div>

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

      {loading ? (
        <p className="text-xs text-zinc-500">Loading users...</p>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
          <p className="text-zinc-400 text-sm">No users found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => {
            const currentRole = u.role || "customer";
            return (
              <div
                key={u.uid}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl"
              >
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {u.email || (
                      <span className="text-zinc-500 font-mono text-xs">
                        {u.uid} (no email on record)
                      </span>
                    )}
                    {u.uid === user.uid && (
                      <span className="ml-2 text-[10px] text-zinc-500">
                        (you)
                      </span>
                    )}
                  </p>
                  <span
                    className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      ROLE_BADGE_STYLE[currentRole] || ROLE_BADGE_STYLE.customer
                    }`}
                  >
                    {currentRole}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={currentRole}
                    disabled={savingUid === u.uid}
                    onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 disabled:opacity-50"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </option>
                    ))}
                  </select>
                  {savingUid === u.uid && (
                    <span className="text-[10px] text-zinc-500">Saving...</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
