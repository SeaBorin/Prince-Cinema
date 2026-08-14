import React, { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { db } from "../../../firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const CATEGORY_OPTIONS = ["Popcorn", "Combos", "Beverages", "Snacks"];

const emptyForm = {
  name: "",
  category: "Popcorn",
  price: "",
  description: "",
};

export default function AdminFoodMenu() {
  const { user, role } = useAuth() || {};
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = role === "admin";

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "foodMenu"), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      setItems(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  };

  const handleEditClick = (item) => {
    setForm({
      name: item.name || "",
      category: item.category || "Popcorn",
      price: item.price?.toString() || "",
      description: item.description || "",
    });
    setEditingId(item.id);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedName = form.name.trim();
    const parsedPrice = parseFloat(form.price);

    if (!trimmedName) {
      setError("Item name is required.");
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Please enter a valid price.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: trimmedName,
        category: form.category,
        price: parsedPrice,
        description: form.description.trim(),
      };

      if (editingId) {
        await updateDoc(doc(db, "foodMenu", editingId), payload);
      } else {
        await addDoc(collection(db, "foodMenu"), payload);
      }

      resetForm();
    } catch (err) {
      console.error(err);
      setError("Failed to save item. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId) => {
    const confirmDelete = window.confirm(
      "Delete this menu item? This cannot be undone.",
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "foodMenu", itemId));
      if (editingId === itemId) resetForm();
    } catch (err) {
      console.error(err);
      setError("Failed to delete item.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-zinc-950 text-white p-8 text-center">
        <div className="text-5xl mb-4">🔐</div>
        <h2 className="text-2xl font-bold mb-2">Admin Sign-In Required</h2>
        <p className="text-zinc-400 max-w-md text-sm">
          Please sign in with an admin account to manage the food menu.
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
    <div className="min-h-screen bg-zinc-950 text-white p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Manage Food Menu</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Add, edit, or remove items shown on the Food & Snacks page.
        </p>
      </div>

      {/* Add / Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4"
      >
        <h2 className="text-sm font-bold text-white">
          {editingId ? "Edit Item" : "Add New Item"}
        </h2>

        {error && (
          <div className="text-xs bg-red-950/60 border border-red-800 text-red-400 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              placeholder="e.g. Caramel Popcorn (L)"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">
              Price (USD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              placeholder="3.50"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-zinc-400 block mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 resize-none"
              placeholder="Short description shown to customers"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl text-sm transition disabled:opacity-50"
          >
            {saving ? "Saving..." : editingId ? "Update Item" : "Add Item"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-bold rounded-xl text-sm transition"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Existing Items List */}
      <div>
        <h2 className="text-sm font-bold text-white mb-4">
          Current Menu ({items.length})
        </h2>
        {loading ? (
          <p className="text-xs text-zinc-500">Loading menu...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
            <p className="text-zinc-400 text-sm">
              No menu items yet. Add your first one above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white truncate">
                      {item.name}
                    </p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 truncate">
                    {item.description}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-bold text-amber-400">
                    ${item.price?.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleEditClick(item)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-400 border border-rose-800/60 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
