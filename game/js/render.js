// render.js — draws the kitchen on canvas: wall, window, stove, plate,
// ingredient counter and trash. All art is vector shapes drawn in code.
import { INGREDIENTS, ING_BY_ID } from './dishes.js';
import { dishReady } from './kitchen.js';

export const W = 960;
export const H = 540;

// Clickable zones, shared with main.js input handling.
export const LAYOUT = {
  bins: [0, 1, 2, 3, 4, 5].map((i) => ({ x: 40 + i * 118, y: 398, w: 104, h: 96 })),
  pan: { x: 712, y: 268, r: 52 },
  plate: { x: 330, y: 296, r: 72 },
  trash: { x: 800, y: 404, w: 116, h: 92 },
};

const BIN_COLORS = ['#8a5a33', '#7a4e2c', '#8a5a33', '#7a4e2c', '#8a5a33', '#7a4e2c'];

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawIngredient(ctx, id, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  if (id === 'noodle') {
    // A nest of wavy strands.
    ctx.strokeStyle = '#f2c14e'; ctx.lineWidth = r * 0.2; ctx.lineCap = 'round';
    for (let k = -1; k <= 1; k++) {
      ctx.beginPath();
      for (let x = -r * 0.85; x <= r * 0.85; x += 4) {
        const y = k * r * 0.34 + Math.sin(x * 0.09 + k * 2) * r * 0.14;
        x <= -r * 0.85 + 1 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  } else if (id === 'rice') {
    ctx.fillStyle = '#f5f0e1';
    ctx.beginPath(); ctx.arc(0, r * 0.15, r * 0.85, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#fffdf5';
    for (const [dx, dy, s] of [[-0.4, -0.3, 0.16], [0.1, -0.45, 0.18], [0.45, -0.2, 0.14], [0, 0.05, 0.15]]) {
      ctx.beginPath(); ctx.arc(dx * r, dy * r, s * r, 0, Math.PI * 2); ctx.fill();
    }
  } else if (id === 'egg') {
    ctx.fillStyle = '#fff8e6';
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.95, r * 0.7, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f5a623';
    ctx.beginPath(); ctx.arc(r * 0.1, -r * 0.05, r * 0.42, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd977';
    ctx.beginPath(); ctx.arc(r * 0.02, -r * 0.12, r * 0.16, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'chicken') {
    ctx.fillStyle = '#c98a4b';
    ctx.beginPath(); ctx.ellipse(-r * 0.1, 0, r * 0.7, r * 0.55, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#f0e0c8'; ctx.lineWidth = r * 0.16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(r * 0.45, -r * 0.25); ctx.lineTo(r * 0.85, -r * 0.55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r * 0.45, r * 0.2); ctx.lineTo(r * 0.85, r * 0.5); ctx.stroke();
    ctx.fillStyle = '#a86a32';
    ctx.beginPath(); ctx.arc(-r * 0.2, -r * 0.1, r * 0.28, 0, Math.PI * 2); ctx.fill();
  } else if (id === 'greens') {
    ctx.fillStyle = '#5da85d';
    for (const rot of [-0.6, 0, 0.6]) {
      ctx.save(); ctx.rotate(rot);
      ctx.beginPath(); ctx.ellipse(0, -r * 0.25, r * 0.32, r * 0.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = '#3d7a3d'; ctx.lineWidth = r * 0.08;
    ctx.beginPath(); ctx.moveTo(0, r * 0.5); ctx.lineTo(0, -r * 0.5); ctx.stroke();
  } else if (id === 'chilli') {
    ctx.strokeStyle = '#d94f3d'; ctx.lineWidth = r * 0.34; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, r * 0.1, r * 0.62, Math.PI * 1.15, Math.PI * 1.95); ctx.stroke();
    ctx.strokeStyle = '#5da85d'; ctx.lineWidth = r * 0.14;
    ctx.beginPath(); ctx.moveTo(r * 0.42, -r * 0.5); ctx.quadraticCurveTo(r * 0.7, -r * 0.75, r * 0.55, -r * 0.95); ctx.stroke();
  }
  ctx.restore();
}

function drawWall(ctx, g) {
  ctx.fillStyle = '#3a2b26'; ctx.fillRect(0, 0, W, 240);
  ctx.fillStyle = '#46332c';
  for (let y = 0; y < 240; y += 40) for (let x = (y % 80 ? 0 : -20); x < W; x += 80) ctx.fillRect(x, y, 76, 36);
  // Window with night sky.
  ctx.fillStyle = '#1d2733'; rr(ctx, 44, 48, 190, 130, 10); ctx.fill();
  ctx.fillStyle = '#f7e8b0'; ctx.beginPath(); ctx.arc(190, 88, 20, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  for (const [sx, sy] of [[70, 70], [110, 130], [150, 66], [210, 140], [90, 100]]) {
    ctx.beginPath(); ctx.arc(sx, sy, 2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = '#2a1f1a'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(139, 48); ctx.lineTo(139, 178); ctx.moveTo(44, 113); ctx.lineTo(234, 113); ctx.stroke();
  // Shelf with jars.
  ctx.fillStyle = '#6b4a2f'; ctx.fillRect(300, 128, 320, 12);
  const jars = ['#d94f3d', '#f2c14e', '#5da85d', '#e8833a'];
  jars.forEach((c, i) => {
    ctx.fillStyle = c; rr(ctx, 320 + i * 72, 84, 44, 44, 8); ctx.fill();
    ctx.fillStyle = '#3a2b26'; ctx.fillRect(328 + i * 72, 76, 28, 10);
  });
  // Hanging lamps.
  for (const lx of [700, 830]) {
    ctx.strokeStyle = '#2a1f1a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, 52); ctx.stroke();
    ctx.fillStyle = '#f7c948';
    ctx.beginPath(); ctx.moveTo(lx - 26, 78); ctx.lineTo(lx + 26, 78); ctx.lineTo(lx, 52); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(247,201,72,0.16)';
    ctx.beginPath(); ctx.arc(lx, 96, 46, 0, Math.PI * 2); ctx.fill();
  }
}

function drawStove(ctx, g) {
  ctx.fillStyle = '#4a4a52'; rr(ctx, 620, 236, 320, 144, 10); ctx.fill();
  ctx.fillStyle = '#33333a'; ctx.fillRect(620, 236, 320, 26);
  // Burners.
  for (const bx of [712, 868]) {
    ctx.fillStyle = '#22222a'; ctx.beginPath(); ctx.arc(bx, 268, 44, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#55555e'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(bx, 268, 34, 0, Math.PI * 2); ctx.stroke();
  }
  // Pan on the left burner.
  const pan = LAYOUT.pan;
  ctx.fillStyle = '#1f1f24'; ctx.beginPath(); ctx.arc(pan.x, pan.y, pan.r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2c2c33'; ctx.beginPath(); ctx.arc(pan.x, pan.y, pan.r - 8, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#55555e'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(pan.x + pan.r - 2, pan.y - 6); ctx.lineTo(pan.x + pan.r + 42, pan.y - 16); ctx.stroke();
  if (g.pan) {
    drawIngredient(ctx, g.pan.ingId, pan.x, pan.y, 30);
    const frac = g.pan.done / g.pan.total;
    ctx.strokeStyle = g.pan.done >= g.pan.total ? '#7ed957' : '#f7c948';
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(pan.x, pan.y, pan.r + 8, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); ctx.stroke();
    if (g.pan.done >= g.pan.total) {
      ctx.fillStyle = '#7ed957'; ctx.font = 'bold 15px system-ui, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('READY!', pan.x, pan.y + pan.r + 26);
    }
    // Steam wisps, fixed by tick so a paused scene is stable.
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let s = 0; s < 3; s++) {
      const ph = (g.tick * 0.03 + s * 2.1) % (Math.PI * 2);
      const sx = pan.x - 22 + s * 22 + Math.sin(ph) * 6;
      const sy = pan.y - 46 - ((g.tick * 0.5 + s * 14) % 26);
      ctx.beginPath(); ctx.moveTo(sx, sy + 12); ctx.quadraticCurveTo(sx + 6, sy + 4, sx, sy); ctx.stroke();
    }
  } else {
    ctx.fillStyle = '#8a8a94'; ctx.font = '13px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('click an ingredient', pan.x, pan.y - pan.r - 12);
    ctx.fillText('that needs cooking', pan.x, pan.y - pan.r + 4);
  }
  ctx.fillStyle = '#c9c9d1'; ctx.font = 'bold 14px system-ui, sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('STOVE', 640, 366);
}

function drawPlate(ctx, g) {
  const p = LAYOUT.plate;
  // Serving shelf.
  ctx.fillStyle = '#5d3a22'; rr(ctx, 100, 356, 480, 16, 6); ctx.fill();
  const ready = dishReady(g);
  if (ready) {
    ctx.strokeStyle = '#7ed957'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 10 + Math.sin(g.tick * 0.1) * 3, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.fillStyle = '#f5f0e1'; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#d8cfb8'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(p.x, p.y, p.r - 10, 0, Math.PI * 2); ctx.stroke();
  const spots = [[-26, -14], [26, -16], [0, 22]];
  g.plate.forEach((id, i) => drawIngredient(ctx, id, p.x + spots[i][0], p.y + spots[i][1], 26));
  if (g.plate.length === 0) {
    ctx.fillStyle = '#9a8f7a'; ctx.font = '14px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('your plate', p.x, p.y + 4);
  }
  ctx.fillStyle = '#e8dcc4'; ctx.font = 'bold 14px system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('PLATE — build the selected order here', p.x, 392);
}

function drawCounter(ctx, g, hover) {
  ctx.fillStyle = '#7a4e2c'; ctx.fillRect(0, 380, W, 160);
  ctx.fillStyle = '#8a5a33'; ctx.fillRect(0, 380, W, 14);
  ctx.fillStyle = '#6b4423';
  for (let x = 20; x < W; x += 90) ctx.fillRect(x, 394, 4, 146);
  LAYOUT.bins.forEach((b, i) => {
    const ing = INGREDIENTS[i];
    const hot = hover === i;
    ctx.fillStyle = hot ? '#a06a3e' : BIN_COLORS[i];
    rr(ctx, b.x, b.y, b.w, b.h, 10); ctx.fill();
    ctx.fillStyle = '#3a2b26'; ctx.fillRect(b.x + 8, b.y + 8, b.w - 16, 6);
    drawIngredient(ctx, ing.id, b.x + b.w / 2, b.y + 40, 26);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(ing.name, b.x + b.w / 2, b.y + 78);
    ctx.fillStyle = '#f7c948'; ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillText(`[${ing.key}]${ing.cook ? ' cook' : ''}`, b.x + b.w / 2, b.y + 94);
  });
  // Trash.
  const t = LAYOUT.trash;
  ctx.fillStyle = '#4a4a52'; rr(ctx, t.x, t.y, t.w, t.h, 10); ctx.fill();
  ctx.fillStyle = '#66666e'; rr(ctx, t.x + 10, t.y + 10, t.w - 20, 14, 4); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('TRASH', t.x + t.w / 2, t.y + 52);
  ctx.fillStyle = '#c9c9d1'; ctx.font = '12px system-ui, sans-serif';
  ctx.fillText('clear plate', t.x + t.w / 2, t.y + 72);
}

export function drawScene(ctx, g, hover = -1) {
  ctx.clearRect(0, 0, W, H);
  drawWall(ctx, g);
  drawStove(ctx, g);
  drawPlate(ctx, g);
  drawCounter(ctx, g, hover);
}
