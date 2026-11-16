// Canvas size and layout, and the glyph cells the renderer does not pick itself: hatching and the background animation.
import { CATEGORIES, DARK, hatchTone, hex, INK } from './data.js';
import { hasStrays, layout } from './layout.js';
import { hatchAt, hatchList, PAX, PAY } from './wood.js';
import { playing, pointerS, T } from './ui.js';
import { LH } from './renderer.js';

// Below 500 px the canvas is a picture you tap by category. Its nodes are too small to tap one by one,
// so projects open from the tree view, and the tree shows only the zoomed category.
export const phone = () => innerWidth < 500;
export const canvas = document.getElementById('canvas'), cv = document.getElementById('cv'), ctx = cv.getContext('2d');
export let W, H, cols, rows, cw, groundY, S;
// The renderer (renderer.js) turns the ink drawing into glyphs. main.js sets it once it is up. Without WebGL 2 it stays null.
export let renderer = null;
export function setRenderer(st) { renderer = st; }

// BASE_AREA: the node area the base canvas's oval layout bounds holds: a sum of rUnit() squared of 75,000, times pi / 4, the share
// of a rectangle an oval fills.
// rUnit(): a node's radius before scaling. K: how much nodes shrink in a tree past 1.3 times BASE_AREA.
// TF: the trunk's height as a share of the drawing. GROW: the most a big tree's canvas grows past its base height.
// TF_FIT: the trunk's share on a canvas that fits the window, shorter so the layout bounds keep its height. FIT_MAX: the most
// the nodes shrink there.
const GROW = 1.3, TF_FIT = 0.2, FIT_MAX = 2.2;
export let TF = 0.3;
// From 1024 px up an open project grows over the canvas. Without WebGL 2 there is no canvas, so it opens in the page.
const wide = matchMedia('(min-width: 1024px)');
export const growNow = () => wide.matches && !document.body.classList.contains('no-gl');
const BASE_AREA = 59000;
export const rUnit = p => 24 + Math.log2(p.months * 4 + 1) * 7;
export let K = 1;
let layoutKey = '';
export function resize() {
  if (!canvas.clientWidth) return;   // hidden behind an open project: closeProject() measures again
  W = canvas.clientWidth;
  // A bigger tree first gets a taller canvas, up to 1.3 times the base height. Past that, its nodes shrink, as a real
  // tree with more leaves has smaller leaves, so the layout bounds keep its shape. crowd: the tree's node area over BASE_AREA.
  const crowd = CATEGORIES.reduce((a, b) => a + b.nodes.reduce((c, cl) => c + rUnit(cl.p) ** 2, 0), 0) / BASE_AREA;
  K = Math.sqrt(Math.min(1, GROW / crowd));
  const hx0 = Math.min(GROW, Math.max(1, crowd));
  // The layout depends only on the canvas's size, so a resize that keeps the size (the font loading, the page load) skips it.
  if (growNow()) {
    // From 1024 px up the canvas's height is what the window leaves (CSS sizes #cv). The drawing scales to fit it.
    // If a node strays into another category, the nodes shrink 10% and the layout runs again, up to FIT_MAX.
    cv.style.height = ''; TF = TF_FIT;
    H = cv.clientHeight; groundY = H - 40;
    if (layoutKey !== `${W}x${H}`) {
      for (let hx = hx0; ; hx += 0.1) { S = Math.min(W / 1200, H / hx / 600) * 1.05; layout(); if (hx >= FIT_MAX - 0.001 || !hasStrays()) break; }
      layoutKey = `${W}x${H}`;
    }
  } else if (layoutKey !== `${W}`) {
    TF = 0.3;
    const H0 = Math.round(Math.min(720, Math.max(460, W * 0.56)));
    S = Math.min(W / 1200, H0 / 600) * 1.05;
    // If a node still strays into another category, the canvas grows 10% more and the layout runs again, up to the cap.
    for (let hx = hx0; ; hx += 0.1) { H = Math.round(H0 * Math.min(hx, GROW)); groundY = H - 40; layout(); if (hx >= GROW - 0.001 || !hasStrays()) break; }
    cv.style.height = H + 'px';
    layoutKey = `${W}`;
  }
  document.getElementById('glyphs').style.top = cv.offsetTop + 'px';   // the drawing sits exactly over #cv, under the category tabs
  const dpr = devicePixelRatio || 1;
  cv.width = W * dpr; cv.height = H * dpr;
  const st = renderer;
  if (!st) return;   // the cell grid comes from the renderer
  cw = st.cw;
  cols = Math.floor(W / cw); rows = Math.floor(H / LH);
  st.resize({ W, H, cols, rows, dpr });
}

// Each row lists only the hatched nodes that can reach it, so a cell tests a few nodes, not all 31.
function hatchRows() {
  const out = Array.from({ length: rows }, () => []);
  hatchList.forEach(h => {
    const k = Math.sqrt(h.merged ? 0.8 : 0.62), rx = h.r * PAX * k, ry = h.r * PAY * k;
    h.c0 = (h.x - rx) / cw - 1; h.c1 = (h.x + rx) / cw + 1;
    const r0 = Math.max(0, Math.floor((h.y - ry) / LH) - 1), r1 = Math.min(rows - 1, Math.ceil((h.y + ry) / LH) + 1);
    for (let r = r0; r <= r1; r++) out[r].push(h);
  });
  return out;
}
// Hatching and the background animation run here, one byte record per cell.
// cellA = glyph code, kind (1 hatch, 2 background), cellB = colour. The renderer does the ink cells on the GPU.
let cellA = null, cellB = null, cellRow = 0;
// A CSS colour as [r, g, b] from 0 to 255 and alpha from 0 to 1, cached. gpu-path.js uses it too.
const styleCache = new Map();
export function styleRGBA(st) {
  let v = styleCache.get(st);
  if (!v) {
    if (st[0] === '#') v = [...hex(st), 1];
    else { const m = st.match(/[\d.]+/g).map(Number); v = [m[0], m[1], m[2], m[3] ?? 1]; }
    styleCache.set(st, v);
  }
  return v;
}
function putCell(c, ch, style, kind) {
  const i = (cellRow * cols + c) * 4, v = style ? styleRGBA(style) : [0, 0, 0, 0];
  cellA[i] = ch.charCodeAt(0); cellA[i + 1] = kind;
  cellB[i] = v[0]; cellB[i + 1] = v[1]; cellB[i + 2] = v[2]; cellB[i + 3] = Math.round(v[3] * 255);
}
export function rasterize(st) {
  ctx.clearRect(0, 0, W, H);
  const n = cols * rows * 4;
  if (!cellA || cellA.length !== n) { cellA = new Uint8Array(n); cellB = new Uint8Array(n); } else cellA.fill(0);
  const hrows = hatchRows();
  for (let r = 0; r < rows; r++) {
    cellRow = r; const hl = hrows[r];
    for (let c = 0; c < cols; c++) {
      const hh = hl.length ? hatchAt(c, r, hl) : null;
      if (hh) {
        if (hh.ch === ' ') { putCell(c, ' ', null, 1); continue; }
        const { R, G, B, a, pure } = hh.h, m = pure ? 0 : 0.2;
        putCell(c, hh.ch, hatchTone(R, G, B, m, a), 1);
        continue;
      }
      backgroundCell(c, r);
    }
  }
  st.render({ cellA, cellB, dark: DARK, ink: INK });
}

// The background animation: faint glyphs drifting like wind, rippling from the cursor. It stops while paused.
function backgroundCell(c, r) {
  const x = c * cw, y = r * LH;
  // Thin streaks blowing left to right, bending slowly, like wind over grass.
  const bend = Math.sin(r * 0.09 + T * 0.25) * 3;
  let v = Math.sin(c * 0.09 - T * 1.6 + bend) * Math.sin(r * 1.7 + c * 0.02);
  if (pointerS) { const d = Math.hypot(x - pointerS.x, y - pointerS.y); v += Math.sin(d * 0.07 - T * 6) * 0.9 * Math.exp(-d / 90); }
  if (v < 0.82 || !playing) return;
  putCell(c, v > 0.95 ? '~' : '-', DARK ? (v > 0.95 ? '#5d665f' : '#434a45') : v > 0.95 ? '#959c93' : '#b0b6ad', 2);
}
