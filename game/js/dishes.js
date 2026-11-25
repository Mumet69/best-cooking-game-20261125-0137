// dishes.js — the menu: ingredients and dishes of the Golden Ladle stall.
// Every dish is an original name with 3 ingredients; `cook` marks the ones
// that must spend time in the pan before they can join the plate.
export const INGREDIENTS = [
  { id: 'noodle',   name: 'Noodle',  key: '1', color: '#f2c14e', cook: true,  cookSecs: 3 },
  { id: 'rice',     name: 'Rice',    key: '2', color: '#f5f0e1', cook: true,  cookSecs: 3 },
  { id: 'egg',      name: 'Egg',     key: '3', color: '#fff3c4', cook: true,  cookSecs: 2 },
  { id: 'chicken',  name: 'Chicken', key: '4', color: '#c98a4b', cook: true,  cookSecs: 4 },
  { id: 'greens',   name: 'Greens',  key: '5', color: '#5da85d', cook: false, cookSecs: 0 },
  { id: 'chilli',   name: 'Chilli',  key: '6', color: '#d94f3d', cook: false, cookSecs: 0 },
];

export const ING_BY_ID = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));

export const DISHES = [
  { id: 'ember-noodle', name: 'Ember Noodle Bowl', price: 18, items: ['noodle', 'greens', 'chilli'] },
  { id: 'golden-rice',  name: 'Golden Fried Rice', price: 16, items: ['rice', 'egg', 'greens'] },
  { id: 'smoky-skewer', name: 'Smoky Chicken Skewer', price: 22, items: ['chicken', 'chilli', 'greens'] },
  { id: 'sunrise-rice', name: 'Sunrise Egg Rice',  price: 15, items: ['rice', 'egg', 'chilli'] },
  { id: 'garden-bowl',  name: 'Garden Green Bowl', price: 12, items: ['rice', 'greens', 'chilli'] },
  { id: 'midnight-ramen', name: 'Midnight Ramen',  price: 26, items: ['noodle', 'egg', 'chicken'] },
];

export const DISH_BY_ID = Object.fromEntries(DISHES.map((d) => [d.id, d]));

// Patience (seconds) an order waits before the customer walks away.
export const ORDER_PATIENCE = 45;
// Length of one shift in seconds.
export const SHIFT_SECS = 180;
// How often a new order appears (seconds), once a slot is free.
export const ORDER_EVERY_SECS = 11;
// Coins for a perfect (fast) serve, on top of the dish price.
export const PERFECT_TIP = 8;
