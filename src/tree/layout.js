// Places each node inside the layout bounds, and the trunk shape.
import { CATEGORIES, TRUNK_X } from './data.js';
import { clamp01 } from './lib.js';
import { STEP, STEPS } from './timeline.js';
import { groundY, H, K, rUnit, S, TF, W } from './glyphs.js';
import { buildWood } from './wood.js';

export const spring = (s, target, dt, k = 40, damp = 6) => { s.v += ((target - s.a) * k - s.v * damp) * dt; s.a += s.v * dt; };
export const wind = (x, t) => 0.5 * Math.sin(t * 0.8 + x * 0.003) + 0.3 * Math.sin(t * 1.9 + x * 0.01);
export const rgba = (R, G, B, a) => `rgba(${R | 0},${G | 0},${B | 0},${Math.min(1, a)})`;

export const mean = (list, f) => list.reduce((a, c) => a + f(c), 0) / list.length;
const COH = 0.02;   // pull toward the category centre, per pass
// Within a category the newest project sits furthest from the trunk, so each category grows outward and the tree
// stays round. No node rises above its category's own spiral (the cap), so categories keep their own area.
export function layout() {
  const trunkTop = { x: W * TRUNK_X, y: groundY - H * TF };
  // Rank of a position: lower comes first and goes to the newest project.
  const rank = (b, ox, oy) => -Math.hypot(b.x + ox - trunkTop.x, (b.y + oy - trunkTop.y) * 1.6);
  CATEGORIES.forEach(b => {
    b.x = W * b.cx; b.y = H * b.cy + 20;
    // Slots on a spiral round the category tip. The newest project takes the first-ranked slot.
    const spot = j => { const a = j * 2.4 + 0.6, dist = j ? (34 + 22 * Math.sqrt(j)) * S * K : 0; return [Math.cos(a) * dist * 1.3, Math.sin(a) * dist * 0.8]; };
    b.top = Math.min(...b.nodes.map((_, j) => spot(j)[1]));   // the spiral's highest point, for the cap
    const slots = b.nodes.map((_, j) => j).sort((p, q) => rank(b, ...spot(p)) - rank(b, ...spot(q)));
    b.nodes.forEach((cl, k) => { cl.j = slots[k]; });   // b.nodes is newest first
    b.nodes.forEach(cl => { [cl.ox, cl.oy] = spot(cl.j); cl.r = rUnit(cl.p) * S * K; });
  });
  // Push overlapping nodes apart (all categories), keeping each inside the canvas.
  const all = CATEGORIES.flatMap(b => b.nodes.map(cl => [b, cl]));
  // The layout bounds: an oval 70% of the canvas wide, from the canvas top down to just above the trunk top.
  // A node that strays outside it moves straight back toward the oval's centre.
  const ex = W * 0.5, erx = W * 0.35, ey0 = 6, ey1 = groundY - H * (TF + 0.04), ey = (ey0 + ey1) / 2, ery = (ey1 - ey0) / 2;
  const keep = ([b, cl]) => {
    const rx = Math.max(1, erx - cl.r * 1.1), ry = Math.max(1, ery - cl.r * 0.95);
    const dx = b.x + cl.ox - ex, dy = b.y + cl.oy - ey, d = Math.hypot(dx / rx, dy / ry);
    if (d > 1) { cl.ox = ex + dx / d - b.x; cl.oy = ey + dy / d - b.y; }
    cl.oy = Math.max(cl.oy, b.top);
  };
  const relax = n => { for (let it = 0; it < n; it++) { all.forEach(keep); for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
    const [bi, ci] = all[i], [bj, cj] = all[j];
    const dx = (bj.x + cj.ox - bi.x - ci.ox) / 1.08, dy = (bj.y + cj.oy - bi.y - ci.oy) / 0.92;
    const d = Math.hypot(dx, dy) || 0.01, min = (ci.r + cj.r) * 0.95;
    if (d >= min) continue;
    const push = (min - d) / 2, ux = dx / d * 1.08, uy = dy / d * 0.92;
    ci.ox -= ux * push; ci.oy -= uy * push; cj.ox += ux * push; cj.oy += uy * push;
  }
    // Each node drifts a little toward its own category's centre, so pushes from other categories cannot carry it into theirs.
    CATEGORIES.forEach(b => { const mx = mean(b.nodes, c => c.ox), my = mean(b.nodes, c => c.oy); b.nodes.forEach(c => { c.ox += (mx - c.ox) * COH; c.oy += (my - c.oy) * COH; }); });
  } all.forEach(keep); };
  relax(160);
  // Pushing nodes apart can swap two ranks. Hand the positions out again by age, newest first, and push apart again.
  const inverted = b => b.nodes.some(c => b.nodes.some(o => c.p.year > o.p.year && rank(b, c.ox, c.oy) > rank(b, o.ox, o.oy)));
  const handOut = b => {
    const pos = b.nodes.map(cl => [cl.ox, cl.oy]).sort((p, q) => rank(b, ...p) - rank(b, ...q));
    b.nodes.forEach((cl, k) => { [cl.ox, cl.oy] = pos[k]; });
  };
  for (let pass = 0; pass < 8 && CATEGORIES.some(inverted); pass++) { CATEGORIES.forEach(handOut); relax(60); }
  // If any pair is still out of order, hand the positions out by age once more, with no push-apart after it. That makes
  // the order exact. Nodes of different sizes can then overlap a little more.
  if (CATEGORIES.some(inverted)) CATEGORIES.forEach(handOut);
  buildWood();
}

// Is any node closer to another category's centre than to its own? resize() grows the canvas until none is.
export function hasStrays() {
  const all = CATEGORIES.flatMap(b => b.nodes.map(cl => ({ b, cl, x: b.x + cl.ox, y: b.y + cl.oy })));
  const mid = new Map(CATEGORIES.map(b => { const m = all.filter(q => q.b === b); return [b, { x: mean(m, q => q.x), y: mean(m, q => q.y) }]; }));
  return all.some(q => { const d = b => Math.hypot(mid.get(b).x - q.x, mid.get(b).y - q.y); return CATEGORIES.some(b => b !== q.b && d(b) < d(q.b)); });
}
const OL = 0.45;   // how far up the upper trunk the left side limb leaves
// The trunk at a height fraction th (1 is full height). O: where the left (-1), top (0) and right (1) side limbs leave it.
export function trunkGeo(th, sway = 0) {
  const tx = W * TRUNK_X, base = groundY, top = groundY - H * TF * th;
  const T1x = tx - 12 * S, T1y = base - (base - top) * 0.5, F0x = tx + 10 * S + sway * 0.2, F0y = top;
  return { tx, base, T1x, T1y, F0x, F0y, O: { '-1': [T1x + (F0x - T1x) * OL, T1y + (F0y - T1y) * OL], '0': [F0x, F0y], '1': [F0x, F0y] } };
}
// The trunk rises over the whole growth, fast at first and slowing to rest at the end.
export const trunkH = (st = STEP) => { const x = clamp01(st / STEPS); return 0.42 + 0.58 * (1 - (1 - x) * (1 - x)); };
