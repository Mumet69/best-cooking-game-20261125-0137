// kitchen.js — game state and rules for the Golden Ladle stall.
// One shift: orders arrive on the board, the cook assembles dishes on the
// plate (cooking what needs the pan first) and serves before patience runs
// out. Three lost customers end the shift early; the shift timer ends it.
import { mulberry32, pick } from './rng.js';
import { DISHES, DISH_BY_ID, ING_BY_ID, ORDER_PATIENCE, SHIFT_SECS, ORDER_EVERY_SECS, PERFECT_TIP } from './dishes.js';
import { sfx, sizzleStart, sizzleStop } from './audio.js';

export const MAX_ORDERS = 3;
export const MAX_HEARTS = 3;

export function newGame(seed) {
  return {
    seed,
    rng: mulberry32(seed),
    phase: 'title', // title | playing | over
    timeLeft: SHIFT_SECS,
    coins: 0,
    served: 0,
    lost: 0,
    hearts: MAX_HEARTS,
    combo: 0,
    bestCombo: 0,
    orders: [], // {id, dishId, patience, maxPatience}
    nextOrderId: 1,
    orderTimer: 4, // first order arrives quickly
    plate: [], // ingredient ids on the plate, in order added
    pan: null, // {ingId, done, total} | null
    selectedOrder: null, // order id the plate is being built for
    flash: null, // {text, kind, until} transient banner
    toast: null, // {text, until}
    tick: 0,
    paused: false,
  };
}

export function startShift(g) {
  g.phase = 'playing';
  g.timeLeft = SHIFT_SECS;
  sfx.start();
}

function spawnOrder(g) {
  if (g.orders.length >= MAX_ORDERS) return;
  const dish = pick(g.rng, DISHES);
  const order = {
    id: g.nextOrderId++,
    dishId: dish.id,
    patience: ORDER_PATIENCE,
    maxPatience: ORDER_PATIENCE,
  };
  g.orders.push(order);
  if (g.selectedOrder === null) g.selectedOrder = order.id;
}

export function selectedOrder(g) {
  return g.orders.find((o) => o.id === g.selectedOrder) ?? g.orders[0] ?? null;
}

// True when the plate holds exactly the dish's items (any order).
export function plateMatches(g, dishId) {
  const want = DISH_BY_ID[dishId].items.slice().sort();
  const have = g.plate.slice().sort();
  return want.length === have.length && want.every((w, i) => w === have[i]);
}

export function dishReady(g) {
  const o = selectedOrder(g);
  return o !== null && plateMatches(g, o.dishId);
}

export function pickIngredient(g, ingId) {
  if (g.phase !== 'playing' || g.paused) return;
  const ing = ING_BY_ID[ingId];
  if (!ing) return;
  if (ing.cook) {
    if (g.pan) { g.toast = { text: 'Pan is busy — wait for it', until: g.tick + 90 }; sfx.bad(); return; }
    g.pan = { ingId, done: 0, total: ing.cookSecs };
    sfx.cook();
    sizzleStart();
    return;
  }
  if (g.plate.length >= 3) { g.toast = { text: 'Plate is full — serve or clear it', until: g.tick + 90 }; sfx.bad(); return; }
  g.plate.push(ingId);
  sfx.pick();
}

export function takeFromPan(g) {
  if (g.phase !== 'playing' || g.paused || !g.pan) return;
  if (g.pan.done < g.pan.total) { g.toast = { text: 'Still cooking…', until: g.tick + 60 }; return; }
  if (g.plate.length >= 3) { g.toast = { text: 'Plate is full — serve or clear it', until: g.tick + 90 }; return; }
  g.plate.push(g.pan.ingId);
  g.pan = null;
  sizzleStop();
  sfx.drop();
}

export function clearPlate(g) {
  if (g.phase !== 'playing' || g.paused) return;
  if (g.plate.length === 0) return;
  g.plate = [];
  sfx.drop();
}

export function serveDish(g) {
  if (g.phase !== 'playing' || g.paused) return false;
  const o = selectedOrder(g);
  if (!o || !plateMatches(g, o.dishId)) { sfx.bad(); return false; }
  const dish = DISH_BY_ID[o.dishId];
  const fast = o.patience > o.maxPatience * 0.5;
  const tip = fast ? PERFECT_TIP + g.combo * 2 : 2 + g.combo;
  const earned = dish.price + tip;
  g.coins += earned;
  g.served += 1;
  g.combo += 1;
  g.bestCombo = Math.max(g.bestCombo, g.combo);
  g.orders = g.orders.filter((x) => x.id !== o.id);
  g.selectedOrder = g.orders[0]?.id ?? null;
  g.plate = [];
  g.flash = { text: `+${earned} coins · ${fast ? 'Perfect!' : 'Served!'}`, kind: 'good', until: g.tick + 110 };
  sfx.ding();
  sfx.coin();
  return true;
}

export function selectOrder(g, orderId) {
  if (g.orders.some((o) => o.id === orderId)) g.selectedOrder = orderId;
}

function endShift(g, reason) {
  g.phase = 'over';
  g.endReason = reason;
  sizzleStop();
  if (reason === 'time') sfx.ding(); else sfx.bad();
}

export function update(g, dt) {
  if (g.phase !== 'playing' || g.paused) return;
  g.tick += 1;
  g.timeLeft -= dt;
  if (g.timeLeft <= 0) { g.timeLeft = 0; endShift(g, 'time'); return; }
  // Orders arrive on a timer.
  g.orderTimer -= dt;
  if (g.orderTimer <= 0) {
    spawnOrder(g);
    g.orderTimer = ORDER_EVERY_SECS;
  }
  // Patience drains; a lost customer costs a heart and breaks the combo.
  for (const o of g.orders.slice()) {
    o.patience -= dt;
    if (o.patience <= 0) {
      g.orders = g.orders.filter((x) => x.id !== o.id);
      g.lost += 1;
      g.hearts -= 1;
      g.combo = 0;
      if (g.selectedOrder === o.id) g.selectedOrder = g.orders[0]?.id ?? null;
      g.flash = { text: 'Customer walked away!', kind: 'bad', until: g.tick + 110 };
      sfx.bad();
      if (g.hearts <= 0) { endShift(g, 'hearts'); return; }
    }
  }
  // The pan cooks.
  if (g.pan) {
    g.pan.done += dt;
    if (g.pan.done >= g.pan.total) {
      g.pan.done = g.pan.total;
      g.flash = { text: `${ING_BY_ID[g.pan.ingId].name} is ready — take it!`, kind: 'good', until: g.tick + 90 };
    }
  }
}
