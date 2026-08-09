import React, { useState } from "react";

export default function FoodCard({ item, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  const getCategoryImage = (category) => {
    switch (category) {
      case "Popcorn":
        return "https://images.unsplash.com/photo-1578849278619-e73505e9610f?q=80&w=600&auto=format&fit=crop";
      case "Combos":
        return "https://images.unsplash.com/photo-1585647347384-2593bc35786b?q=80&w=600&auto=format&fit=crop";
      case "Beverages":
      case "Drinks":
        return "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop";
      case "Snacks":
        return "https://images.unsplash.com/photo-1626957341926-98752fc2ba90?q=80&w=600&auto=format&fit=crop";
      default:
        return "https://images.unsplash.com/photo-1585647347384-2593bc35786b?q=80&w=600&auto=format&fit=crop";
    }
  };

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(item, quantity);
    }
  };

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/80 transition-all duration-300 hover:scale-[1.02] hover:border-zinc-700 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between p-4">
      <div>
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-950 rounded-xl mb-4 border border-zinc-800/60">
          <img
            src={getCategoryImage(item.category)}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/80 backdrop-blur-md text-amber-400 text-[10px] font-bold rounded-lg border border-white/10 uppercase tracking-wider">
            {item.category}
          </div>
        </div>

        <h3 className="text-base font-extrabold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
          {item.name}
        </h3>
        <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-zinc-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-lg font-black text-amber-400">
            ${item.price.toFixed(2)}
          </span>

          <div className="flex items-center gap-2 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center justify-center transition cursor-pointer"
            >
              -
            </button>
            <span className="text-xs font-bold text-amber-400 w-4 text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center justify-center transition cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/10 transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>🍿 Add to Order</span>
          <span className="opacity-80 font-normal">
            (${(item.price * quantity).toFixed(2)})
          </span>
        </button>
      </div>
    </div>
  );
}
