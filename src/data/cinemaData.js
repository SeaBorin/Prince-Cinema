// F:\react-course\react-app-two\prince-cinema-app\src\data\cinemaData.js

import { getDynamicShowtimes } from "../services/utils/timeUtils.js";

export const CAMBODIA_BRANCHES = [
  {
    id: "phnom-penh-aeon1",
    name: "Prince Cinema - AEON Mall Phnom Penh (AEON 1)",
    location: "Hun Sen Boulevard, Phnom Penh",
    halls: ["Hall 1 (VIP)", "Hall 2 (IMAX)", "Hall 3 (Standard)"],
  },
  {
    id: "phnom-penh-aeon2",
    name: "Prince Cinema - AEON Mall Sen Sok (AEON 2)",
    location: "Sen Sok, Phnom Penh",
    halls: ["Screen 1 (4DX)", "Screen 2 (VIP)", "Screen 3 (Standard)"],
  },
  {
    id: "phnom-penh-tul-kork",
    name: "Prince Cinema - TK Avenue Toul Kork",
    location: "St 315, Toul Kork, Phnom Penh",
    halls: ["Hall A", "Hall B"],
  },
  {
    id: "siem-reap-heritage",
    name: "Prince Cinema - Heritage Walk Siem Reap",
    location: "National Road 6, Siem Reap",
    halls: ["Hall 1", "Hall 2 (VIP)"],
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
