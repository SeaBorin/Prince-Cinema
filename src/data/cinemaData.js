// F:\react-course\react-app-two\prince-cinema-app\src\data\cinemaData.js

import { getDynamicShowtimes } from "../services/utils/timeUtils.js";

export const CAMBODIA_BRANCHES = [
  {
    id: "prince-eden",
    name: "Prince Cinema - Eden Garden",
    location: "Eden Garden, Phnom Penh",
    halls: ["Hall 1 (2D Standard)", "Hall 2 (2D Standard)"],
  },
  {
    id: "prince-exchange",
    name: "Prince Cinema - Exchange Square",
    location: "Exchange Square, Phnom Penh",
    halls: ["Hall 1 (2D Standard)", "Hall 2 (2D Standard)"],
  },
  {
    id: "prince-aeon1",
    name: "Prince Cinema - AEON Mall 1",
    location: "AEON Mall Phnom Penh, Hun Sen Boulevard",
    halls: ["Hall 1 (VIP)", "Hall 2 (IMAX)", "Hall 3 (Standard)"],
  },
  {
    id: "prince-aeon2",
    name: "Prince Cinema - Sen Sok (AEON 2)",
    location: "AEON Mall Sen Sok, Phnom Penh",
    halls: ["Screen 1 (4DX)", "Screen 2 (VIP)", "Screen 3 (Standard)"],
  },
  {
    id: "prince-samai",
    name: "Prince Cinema - Samai Square",
    location: "Samai Square, Phnom Penh",
    halls: ["Hall 1 (2D Standard)", "Hall 2 (2D Standard)"],
  },
  {
    id: "prince-citymall",
    name: "Prince Cinema - City Mall",
    location: "City Mall, Phnom Penh",
    halls: ["Hall 1 (2D Standard)", "Hall 2 (2D Standard)"],
  },
];

export const getShowtimes = () => getDynamicShowtimes();

export const FOOD_ITEMS = [
  {
    id: "popcorn-combo-1",
    name: "Classic Combo (1 Popcorn + 1 Soft Drink)",
    price: 4.0,
    category: "Combos",
  },
  {
    id: "popcorn-combo-2",
    name: "Couple Combo (1 Large Popcorn + 2 Soft Drinks)",
    price: 6.5,
    category: "Combos",
  },
  {
    id: "sweet-popcorn",
    name: "Caramel / Cheese Popcorn (L)",
    price: 3.5,
    category: "Popcorn",
  },
  {
    id: "coca-cola",
    name: "Coca-Cola / Sprite (32oz)",
    price: 2.0,
    category: "Drinks",
  },
];
