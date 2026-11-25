// audio.js — tiny synthesised sounds (WebAudio, no audio files).
// All original: short oscillator/noise blips for pick, sizzle, ding and fail.
let ctx = null;
let sizzleNodes = null;

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function blip(freq, dur, type = 'sine', vol = 0.12, when = 0) {
  try {
    const c = ac();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, c.currentTime + when);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + when + dur);
    o.connect(g).connect(c.destination);
    o.start(c.currentTime + when);
    o.stop(c.currentTime + when + dur + 0.02);
  } catch { /* audio is optional */ }
}

export const sfx = {
  pick() { blip(660, 0.07, 'triangle', 0.10); },
  drop() { blip(330, 0.08, 'triangle', 0.10); },
  cook() { blip(220, 0.15, 'sawtooth', 0.05); },
  ding() { blip(880, 0.12, 'sine', 0.14); blip(1318, 0.25, 'sine', 0.12, 0.09); },
  coin() { blip(988, 0.08, 'square', 0.06); blip(1319, 0.16, 'square', 0.06, 0.07); },
  bad() { blip(196, 0.25, 'sawtooth', 0.08); blip(147, 0.35, 'sawtooth', 0.08, 0.12); },
  start() { blip(523, 0.1, 'triangle', 0.1); blip(659, 0.1, 'triangle', 0.1, 0.09); blip(784, 0.2, 'triangle', 0.1, 0.18); },
};

export function sizzleStart() {
  try {
    const c = ac();
    if (sizzleNodes) return;
    const len = c.sampleRate * 1;
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf; src.loop = true;
    const f = c.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 4200; f.Q.value = 0.6;
    const g = c.createGain();
    g.gain.value = 0.045;
    src.connect(f).connect(g).connect(c.destination);
    src.start();
    sizzleNodes = { src, g };
  } catch { /* audio is optional */ }
}

export function sizzleStop() {
  try {
    if (!sizzleNodes) return;
    sizzleNodes.src.stop();
    sizzleNodes.g.disconnect();
    sizzleNodes = null;
  } catch { sizzleNodes = null; }
}
