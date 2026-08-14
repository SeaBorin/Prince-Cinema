import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { db } from "../../../firebase";
import {
  doc,
  setDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import FoodCard from "../FoodCard";
import PaymentModal from "../PaymentModal";

export default function FoodList({ onRequireAuth }) {
  const { user, currentUser } = useAuth();
  const activeUser = user || currentUser;

  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [pendingOrder, setPendingOrder] = useState(null);

  // Live menu, editable by admins via /admin-food
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "foodMenu"), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      setMenuItems(list);
      setMenuLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(menuItems.map((item) => item.category))).sort(),
  ];

  const filteredItems =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const handleAddToCart = (item, quantity) => {
    const existingIndex = cart.findIndex((c) => c.id === item.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      setCart(updated);
    } else {
      setCart([...cart, { ...item, quantity }]);
    }
  };

  const handleRemoveFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((c) => c.id !== itemId));
  };

  const totalCartAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleConfirmSnackPass = () => {
    if (cart.length === 0) return;

    if (!activeUser) {
      if (typeof onRequireAuth === "function") {
        onRequireAuth();
      } else {
        alert("Please sign in to confirm your snack order.");
      }
      return;
    }

    const orderData = {
      type: "food",
      items: cart,
      totalAmount: totalCartAmount,
      orderId:
        "SNACK-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    setPendingOrder(orderData);
  };

  const handleCancelOrderPayment = () => {
    setPendingOrder(null);
  };

  const handleCloseOrderPayment = () => {
    setPendingOrder(null);
  };

  const handleOrderPaymentSuccess = async (paidOrder) => {
    setPendingOrder(null);
    setCart([]);

    if (activeUser) {
      try {
        const referenceCode = paidOrder.orderId || `SNACK-${Date.now()}`;
        const orderRef = doc(db, "bookings", referenceCode);
        await setDoc(orderRef, {
          ...paidOrder,
          uid: activeUser.uid,
          pickedUp: false,
          createdAt: serverTimestamp(),
          status: "CONFIRMED",
        });
      } catch (error) {
        console.error("Error saving snack order to Firestore:", error);
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-[80vh] text-zinc-100 space-y-8">
      <div className="border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <span>Cinema Food & Concessions</span>
            <span className="text-amber-500 text-2xl">🍿</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Pre-order snacks and ice-cold beverages for your ultimate cinema
            experience.
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {menuLoading ? (
            <p className="text-xs text-zinc-500">Loading menu...</p>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
              <p className="text-zinc-400 text-sm">
                No items available right now. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <FoodCard
                  key={item.id}
                  item={item}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-fit space-y-4 sticky top-28">
          <h2 className="text-sm font-bold text-white border-b border-zinc-800 pb-3 flex items-center justify-between">
            <span>Snack Pass Order</span>
            <span className="text-xs font-semibold text-amber-400">
              {cart.reduce((a, b) => a + b.quantity, 0)} Items
            </span>
          </h2>

          {cart.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6">
              Your snack order is empty. Select items to add.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {cart.map((cartItem) => (
                <div
                  key={cartItem.id}
                  className="flex items-center justify-between text-xs bg-zinc-950 p-2.5 rounded-xl border border-zinc-800"
                >
                  <div className="max-w-[60%]">
                    <p className="font-semibold text-zinc-200 truncate">
                      {cartItem.name}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      Qty: {cartItem.quantity} × ${cartItem.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400">
                      ${(cartItem.price * cartItem.quantity).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFromCart(cartItem.id)}
                      aria-label={`Remove ${cartItem.name} from cart`}
                      title="Remove from cart"
                      className="w-5 h-5 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-rose-500/80 text-zinc-400 hover:text-white text-[10px] font-bold transition cursor-pointer shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-zinc-800 pt-3 flex justify-between items-baseline">
            <span className="text-xs font-semibold text-zinc-400">Total</span>
            <span className="text-xl font-black text-amber-500">
              ${totalCartAmount.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            disabled={cart.length === 0}
            onClick={handleConfirmSnackPass}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            Confirm Snack Pass
          </button>
        </div>
      </div>

      <PaymentModal
        booking={pendingOrder}
        isOpen={Boolean(pendingOrder)}
        onClose={handleCloseOrderPayment}
        onBack={handleCancelOrderPayment}
        onPaymentSuccess={handleOrderPaymentSuccess}
      />
    </div>
  );
}
