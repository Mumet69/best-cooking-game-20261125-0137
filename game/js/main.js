// main.js — bootstrap, input, HUD and the render loop for Golden Ladle.
// Also builds the deterministic ?scene= states used for the screenshots:
// each scene is a real game state rendered by the same code players see.
import { newGame, startShift, update, pickIngredient, takeFromPan, clearPlate, serveDish, selectOrder, dishReady, selectedOrder, MAX_ORDERS } from './kitchen.js';
import { INGREDIENTS, DISH_BY_ID, DISHES } from './dishes.js';
import { drawScene, LAYOUT, W, H } from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const seed = Number(params.get('seed') ?? '') || 7;

let g = newGame(seed);
let hover = -1;
window.__game = g;

function makeOrder(dishId, patience) {
  const o = { id: g.nextOrderId++, dishId, patience, maxPatience: patience };
  g.orders.push(o);
  if (g.selectedOrder === null) g.selectedOrder = o.id;
  return o;
}

function applyScene(name) {
  g.phase = 'playing';
  g.paused = true;
  g.tick = 40;
  if (name === 'kitchen') {
    g.timeLeft = 180; g.coins = 0;
    makeOrder('ember-noodle', 45);
    makeOrder('golden-rice', 38);
  } else if (name === 'counter') {
    g.timeLeft = 150; g.coins = 34; g.served = 2; g.combo = 2;
    makeOrder('ember-noodle', 30);
    g.plate = ['noodle', 'greens']; // mid-assembly: chilli still missing
    hover = 5;
  } else if (name === 'cooking') {
    g.timeLeft = 134; g.coins = 52; g.served = 3; g.combo = 1;
    makeOrder('midnight-ramen', 26);
    g.plate = ['noodle'];
    g.pan = { ingId: 'chicken', done: 2.4, total: 4 };
  } else if (name === 'serve') {
    g.timeLeft = 96; g.coins = 96; g.served = 5; g.combo = 3;
    makeOrder('ember-noodle', 32);
    g.plate = ['noodle', 'greens', 'chilli']; // complete, ready to serve
    g.flash = { text: 'Plate complete — serve it!', kind: 'good', until: 9999 };
  }
  drawHUD();
  drawScene(ctx, g, hover);
}

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

function drawHUD() {
  $('timer').textContent = fmtTime(Math.max(0, g.timeLeft));
  $('timer').classList.toggle('low', g.timeLeft <= 30 && g.phase === 'playing');
  $('coins').textContent = `${g.coins} coins`;
  $('hearts').textContent = '♥'.repeat(g.hearts) + '♡'.repeat(3 - g.hearts);
  $('combo').textContent = `combo ×${g.combo}`;
  // Order tickets.
  const box = $('tickets');
  box.innerHTML = '';
  $('no-orders').style.display = g.orders.length ? 'none' : 'block';
  for (const o of g.orders) {
    const dish = DISH_BY_ID[o.dishId];
    const t = document.createElement('div');
    t.className = 'ticket' + (o.id === g.selectedOrder ? ' selected' : '');
    t.onclick = () => { selectOrder(g, o.id); drawHUD(); };
    const chips = dish.items.map((id) => {
      const ing = INGREDIENTS.find((x) => x.id === id);
      const done = g.plate.includes(id) && o.id === g.selectedOrder;
      return `<span class="chip${done ? ' done' : ''}"><span class="dot" style="background:${ing.color}"></span>${ing.name}${ing.cook ? ' <span class="cook">cook</span>' : ''}</span>`;
    }).join('');
    const pct = Math.max(0, (o.patience / o.maxPatience) * 100);
    t.innerHTML = `<span class="dish">${dish.name}</span><span class="price">${dish.price}c</span><div class="needs">${chips}</div><div class="patience${pct < 35 ? ' low' : ''}"><div style="width:${pct}%"></div></div>`;
    box.appendChild(t);
  }
  // Serve button.
  const ready = dishReady(g);
  const sb = $('serve-btn');
  sb.disabled = !ready;
  sb.textContent = ready ? 'SERVE DISH — READY! (Enter)' : 'SERVE DISH (Enter)';
  // Flash / toast.
  const flash = $('flash');
  const msg = (g.flash && g.tick < g.flash.until) ? g.flash : (g.toast && g.tick < g.toast.until ? { text: g.toast.text, kind: '' } : null);
  if (msg) {
    flash.hidden = false;
    flash.textContent = msg.text;
    flash.className = msg.kind === 'bad' ? 'bad' : '';
  } else {
    flash.hidden = true;
  }
  // Overlay for title / game over.
  const ov = $('overlay');
  const card = $('overlay-card');
  if (g.phase === 'title') {
    ov.hidden = false;
    card.innerHTML = `<h2>Golden Ladle</h2><p class="big">Midnight Street Kitchen</p><p>Orders roll in on the board. Click ingredients (or press 1–6) to build each dish on the plate. Ingredients marked <b>cook</b> go to the pan first — take them when they are ready, then serve before the customer walks away.</p><p>One shift lasts 3 minutes. Lose 3 customers and the night ends early. Fast serves pay tips and build your combo.</p><button id="start-btn">START SHIFT</button>`;
    $('start-btn').onclick = () => { startShift(g); ov.hidden = true; drawHUD(); };
  } else if (g.phase === 'over') {
    ov.hidden = false;
    const reason = g.endReason === 'time' ? 'The shift is over — the stall closes for the night.' : 'Three customers walked away — the night ends early.';
    card.innerHTML = `<h2>Shift Over</h2><p>${reason}</p><p class="big">${g.coins} coins · ${g.served} dishes served · best combo ×${g.bestCombo}</p><p>${g.served >= 8 ? 'A legendary night at the Ladle!' : g.served >= 4 ? 'A solid night — the regulars will be back.' : 'A quiet night. The wok will be hotter tomorrow.'}</p><button id="again-btn">COOK AGAIN</button>`;
    $('again-btn').onclick = () => { g = newGame(Date.now() % 2147483647); window.__game = g; startShift(g); ov.hidden = true; drawHUD(); };
  } else {
    ov.hidden = true;
  }
}

function canvasPos(ev) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((ev.clientX - r.left) / r.width) * W,
    y: ((ev.clientY - r.top) / r.height) * H,
  };
}

canvas.addEventListener('click', (ev) => {
  if (g.phase !== 'playing') return;
  const { x, y } = canvasPos(ev);
  const bin = LAYOUT.bins.findIndex((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
  if (bin >= 0) { pickIngredient(g, INGREDIENTS[bin].id); drawHUD(); return; }
  const dx = x - LAYOUT.pan.x, dy = y - LAYOUT.pan.y;
  if (dx * dx + dy * dy <= LAYOUT.pan.r * LAYOUT.pan.r) { takeFromPan(g); drawHUD(); return; }
  const t = LAYOUT.trash;
  if (x >= t.x && x <= t.x + t.w && y >= t.y && y <= t.y + t.h) { clearPlate(g); drawHUD(); }
});

canvas.addEventListener('mousemove', (ev) => {
  const { x, y } = canvasPos(ev);
  hover = LAYOUT.bins.findIndex((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
});

document.addEventListener('keydown', (ev) => {
  if (g.phase !== 'playing' || g.paused) return;
  const ing = INGREDIENTS.find((i) => i.key === ev.key);
  if (ing) { pickIngredient(g, ing.id); drawHUD(); return; }
  if (ev.code === 'Space') { ev.preventDefault(); takeFromPan(g); drawHUD(); }
  if (ev.code === 'Enter') { if (serveDish(g)) drawHUD(); }
  if (ev.code === 'Backspace') { ev.preventDefault(); clearPlate(g); drawHUD(); }
});

$('serve-btn').onclick = () => { if (serveDish(g)) drawHUD(); };
$('clear-btn').onclick = () => { clearPlate(g); drawHUD(); };
$('pan-btn').onclick = () => { takeFromPan(g); drawHUD(); };

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (g.phase === 'playing' && !g.paused) update(g, dt);
  drawScene(ctx, g, hover);
  drawHUD();
  requestAnimationFrame(loop);
}

const scene = params.get('scene');
if (scene) {
  applyScene(scene);
} else {
  drawHUD();
  drawScene(ctx, g, hover);
  requestAnimationFrame(loop);
}
