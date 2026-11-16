// Camera and zoom, the tree drawing, overlays and name labels.
import { BG, CATEGORIES, DARK, categoryOf, byId, DIM, INK, INKC, MONO, TINT, tone, TRUNK_X } from './data.js';
import { clamp01, eo, reduced } from './lib.js';
import { STEP, STEPS } from './timeline.js';
import { ctx, cw, groundY, H, phone, S, W } from './glyphs.js';
import { FONT, LH, SSY } from './renderer.js';
import { rgba, spring, trunkGeo, trunkH, wind } from './layout.js';
import { growthTip, nodeShapePath, hatchList, limb, particles, PAX, PAY, placeWood, WOOD } from './wood.js';
import { canvasKind, closeProject, frame, hoverId, hoverKind, openP, playing, syncFolders, T, VIEW } from './ui.js';

// Camera: a spring-driven zoom onto one category. World coordinates are the unzoomed canvas.
export const cam = { x: { a: 0, v: 0 }, y: { a: 0, v: 0 }, z: { a: 1, v: 0 } };
export let zoomKind = null;
let camTZ = 1;
// Zoom fit: the category's box fills ZFILL of the canvas, the box is at least ZMIN_W by ZMIN_H of the canvas, at most ZMAX.
// Low minimums let the open category fill the frame instead of sharing it with its neighbours.
const ZFILL = 0.92, ZMIN_W = 0.3, ZMIN_H = 0.42, ZMAX = 2.6;
const zoomedIn = k => zoomKind === k && Math.abs(Z() - camTZ) < Math.abs(camTZ - 1) * 0.25 + 0.03;
export const Z = () => cam.z.a;
const toS = (x, y) => [(x - W / 2 - cam.x.a) * Z() + W / 2, (y - H / 2 - cam.y.a) * Z() + H / 2];
export const toW = (x, y) => ({ x: (x - W / 2) / Z() + W / 2 + cam.x.a, y: (y - H / 2) / Z() + H / 2 + cam.y.a });
export function updateCam(dt) {
  let tx = 0, ty = 0, tz = 1;
  const b = zoomKind && categoryOf(zoomKind);
  if (b) {
    const cs = b.nodes.map(c => [b.x + c.ox, b.y + c.oy, c.r]), xs = cs.flatMap(([x, , r]) => [x - r * 1.3, x + r * 1.3]), ys = cs.flatMap(([, y, r]) => [y - r * 1.8, y + r * 1.2]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys, VIEW ? groundY + 12 : -Infinity);   // the split view reaches down to the ground
    // Zoomed with no project open, the category fits left of the info panel's column, so the info panel never covers a node or a name.
    const cd = document.getElementById('info'), infoW = VIEW || !cd.offsetWidth ? 0 : W - cd.offsetLeft, v = VIEW || { x0: 0, y0: 0, x1: infoW ? 1 - (infoW + 16) / W : 1, y1: 1 }, vw = W * (v.x1 - v.x0), vh = H * (v.y1 - v.y0);
    const bw = Math.max(x1 - x0, vw * ZMIN_W), bh = Math.max(y1 - y0, vh * ZMIN_H);
    tz = Math.min(ZMAX, ZFILL * Math.min(vw / bw, vh / bh));
    // The box's centre lands on the visible part's centre.
    tx = (x0 + x1) / 2 - W / 2 - (W * (v.x0 + v.x1) / 2 - W / 2) / tz; ty = (y0 + y1) / 2 - H / 2 - (H * (v.y0 + v.y1) / 2 - H / 2) / tz;
    camTZ = tz;
  }
  spring(cam.x, tx, dt, 32, 7); spring(cam.y, ty, dt, 32, 7); spring(cam.z, tz, dt, 32, 7);
}
const hint = document.getElementById('hint');
export const HINT = hint.textContent;   // the hint index.astro writes
export function setHint() {
  if (phone()) { hint.hidden = false; hint.textContent = zoomKind ? 'Pick a project from the list below.' : 'Tap a category, then pick a project from the list below.'; }
  else { hint.textContent = HINT; if (zoomKind) hint.hidden = true; }   // the hint has done its job after the first zoom
}
export function setZoom(k) {
  if (k !== zoomKind && !reduced) cam.z.v -= 2.2;   // pull back a little before moving: anticipation
  if (openP && k !== openP.kind) closeProject();
  zoomKind = k; CATEGORIES.forEach(q => q.sw.setAttribute('aria-pressed', String(q.kind === k)));
  const back = document.getElementById('back'); back.setAttribute('aria-pressed', String(!k)); back.textContent = k ? '\u2190 all categories' : 'all categories';   // the arrow only when there is somewhere to go back to
  setHint(); syncFolders(); if (reduced) { for (let i = 0; i < 200; i++) updateCam(0.016); } frame(0);
}
addEventListener('keydown', e => { if (e.key !== 'Escape') return; if (openP) closeProject(); else if (zoomKind) setZoom(null); });
document.getElementById('back').addEventListener('click', () => { if (openP) closeProject(); setZoom(null); });

const inNodeShapes = (x, y) => CATEGORIES.some(b => b.box && x > b.box[0] && x < b.box[1] && y > b.box[2] && y < b.box[3] && b.nodes.some(cl => !cl.hidden && ((x - cl.x) / (cl.r * cl.g * 1.12)) ** 2 + ((y - cl.y) / (cl.r * cl.g * 0.98)) ** 2 < 1));   // the node shape as grown so far
const activeId = () => hoverId || (openP && zoomKind === openP.kind ? openP.id : null);
export function drawTree(g, t, dt) {
  const tx = W * TRUNK_X, base = groundY;
  const act = activeId(), actKind = act ? byId(act).kind : hoverKind || canvasKind || zoomKind;
  CATEGORIES.forEach(b => b.sw.classList.toggle('on', b.kind === (hoverKind || canvasKind)));   // hover only: the open category has its tint
  CATEGORIES.forEach(b => {
    spring(b.s, wind(b.x, t) * 10 * S, dt);
    b.bx = b.x + b.s.a; b.by = b.y + b.s.a * 0.2;
    b.g = clamp01(STEP - b.first + 2);   // starts 2 steps before the first project
  });
  const sway = CATEGORIES.reduce((a, b) => a + b.s.a, 0) / CATEGORIES.length;
  // Trunk: two curved segments with a slight lean, a root flare, a shaded right side and bark furrows.
  // It grows taller and thicker over the years. f places a stroke across the trunk as a fraction of its width.
  const geo = trunkGeo(trunkH(), sway), { T1x, T1y, F0x, F0y } = geo;
  const gt = clamp01(STEP / 1.5), girth = 0.55 + 0.45 * clamp01(STEP / STEPS), tg = eo(gt);
  const W0 = 50 * S * girth, W1 = 22 * S * girth, Wm = (W0 + W1) / 2;
  const trunk = (f, w0, w1, a) => {
    limb(g, tx + f * W0, base, T1x + f * Wm, T1y, w0, (w0 + w1) / 2, 10 * S, a, clamp01(tg * 2));
    if (tg > 0.5) limb(g, T1x + f * Wm, T1y, F0x + f * W1, F0y, (w0 + w1) / 2, w1, -10 * S, a, clamp01(tg * 2 - 1));
  };
  // The ground. At 2.6 * S it can cover a single sample row of a cell, too little for any glyph, and it vanishes at some
  // canvas heights (a 370 px canvas). So it is at least two sample rows thick.
  const gw = Math.max(2.6 * S, 2 * LH / SSY);
  limb(g, W * 0.1, base + 4, W * 0.9, base + 4, gw, gw, 0, 0.85);
  limb(g, tx, base + 2, tx, base - 36 * S, 90 * S * girth, W0, 0, 0.35, clamp01(tg * 6));
  trunk(0, W0, W1, 0.3);
  trunk(0.24, W0 * 0.5, W1 * 0.5, 0.35);
  [-0.32, -0.1, 0.12, 0.33].forEach(f => trunk(f, 2.6 * S, 1.6 * S, 0.85));
  [[-1, 70], [1, 80], [-1, 120], [1, 130]].forEach(([d, len]) => limb(g, tx + d * 14 * S, base - 6, tx + d * len * S, base + 10, 12 * S * girth, 2 * S, d * 4, 0.7, eo(gt)));
  // Nodes: springs and twigs first, so node shapes cover the wood.
  CATEGORIES.forEach(b => b.nodes.forEach(cl => {
    const st = cl.p.id === hoverId ? 'hover' : openP && cl.p.id === openP.id ? 'sel' : '';
    spring(cl.s, Math.sin(t * 1.3 + cl.i * 1.7) * 3 * S, dt, 50, 7);
    spring(cl.sy, Math.cos(t * 1.1 + cl.i) * 2 * S, dt, 50, 7);
    const lt = st ? 1.15 : !zoomKind && (canvasKind || hoverKind) === b.kind ? 1.06 : 1;
    if (reduced) cl.lift.a = lt; else spring(cl.lift, lt, dt, 260, 32);   // critically damped: quick, with no overshoot
    cl.x = b.bx + cl.ox + cl.s.a; cl.y = b.by + cl.oy + cl.sy.a; cl.st = st;
    // Growth: the twig reaches out, then the node grows outward from its centre.
    // In steps: the twig grows from 0.75 steps before the project's step, then the node grows from nothing over 2 steps,
    // overlapping the next arrivals. Smoothstep: it starts and ends at rest, with no overshoot.
    const age = STEP - cl.p.step;
    cl.hidden = age < -0.1;
    { const x = clamp01((age + 0.1) / 2); cl.g = x * x * (3 - 2 * x); }
    if (cl.hidden) cl.born = null; else if (cl.born == null) cl.born = T;
  }));
  // Wood: the side limbs, sub-limbs and twigs, placed from where the nodes are this frame, so it rides up with the
  // trunk and sways with the nodes. A limb thickens as the nodes it carries grow.
  // The side limbs and category limbs never go thinner than a share of the trunk top, so they carry on from it.
  const wf = n => (3 + 3 * Math.sqrt(n)) * S;
  WOOD.forEach(root => {
    placeWood(root, ...geo.O[root.side], c => c.x, c => c.y);
    const draw = (n, depth, kid) => {
      n.t = clamp01((STEP - n.s) / (n.e - n.s || 1));
      const on = n.group.some(c => c.p.kind === actKind) ? 1 : depth ? 0.8 : 0.85;
      const bend = (kid ? 1 : -1) * (depth % 2 ? 1 : -1) * Math.min(14 * S, n.len * 0.08);
      if (n.cl) { n.cl.att = [n.px, n.py]; limb(g, n.px, n.py, n.x, n.y, 6 * S, 2 * S, bend, on * 0.9, n.t); growthTip(g, n, bend); return; }
      const ne = Math.max(0.6, n.group.reduce((a, c) => a + (c.hidden ? 0 : c.g), 0)), w = Math.max(wf(ne) * (depth ? 1 : 1.3), W1 * [0.65, 0.4][depth] || 0);   // the first two levels stay in proportion to the trunk top
      limb(g, n.px, n.py, n.x, n.y, w, w * 0.75, bend, on, n.t);
      growthTip(g, n, bend);
      n.kids.forEach((q, i) => draw(q, depth + 1, i));
    };
    draw(root, 0, root.side > 0 ? 1 : 0);
  });
  CATEGORIES.forEach(b => {   // bounding box of the visible nodes, for cheap hit tests
    const v = b.nodes.filter(cl => !cl.hidden);
    b.box = v.length ? [Math.min(...v.map(cl => cl.x - cl.r * 1.3)), Math.max(...v.map(cl => cl.x + cl.r * 1.3)), Math.min(...v.map(cl => cl.y - cl.r * 1.2)), Math.max(...v.map(cl => cl.y + cl.r * 1.2))] : null;
  });
  // Top level: each category is one mass of node shapes in one colour. Inside the open category: one node per project.
  const hk = hoverId && byId(hoverId).kind;
  const focus = zoomKind ? null : canvasKind || hoverKind || hk;
  CATEGORIES.forEach(b => {
    const cls = b.nodes.filter(cl => !cl.hidden);
    if (!cls.length) return;
    const [R, G, B] = TINT[b.kind], rim = rgba(R * 0.8, G * 0.8, B * 0.8, 1);   // the outline of a lit node
    if (b.kind === zoomKind) {
      const hov = cls.some(cl => cl.st === 'hover');
      cls.sort((p, q) => (p.st ? 1 : 0) - (q.st ? 1 : 0)).forEach(cl => {
        const r = cl.r * cl.lift.a * cl.g, on = !!cl.st, dim = hov && !on;
        cl.big = on; cl.dim = dim;
        nodeShapePath(g, cl.x, cl.y, r, cl);
        g.fillStyle = rgba(R, G, B, on ? 0.3 : 0.16); g.fill();
        g.lineWidth = on ? 4 : 2.6; g.strokeStyle = on ? rim : rgba(...INK, dim ? DIM().line : 0.9); g.stroke();
        const [hx, hy] = toS(cl.x, cl.y);
        hatchList.push({ x: hx, y: hy, r: r * Z(), R, G, B, dens: on ? 2 : 1, a: dim ? DIM().zhatch : 1, pure: on });
      });
      return;
    }
    const big = focus === b.kind, dim = (focus && !big) || !!zoomKind, dl = zoomKind ? DIM().far : DIM().line;
    cls.forEach(cl => { cl.big = big; cl.dim = dim; });
    const rad = cl => cl.r * cl.lift.a * cl.g;
    g.beginPath(); cls.forEach(cl => nodeShapePath(g, cl.x, cl.y, rad(cl), cl, false));
    g.fillStyle = rgba(R, G, B, big ? 0.3 : 0.16); g.fill();
    // A project pointed at in the tree view gets its own outline inside the mass, so its node can be found.
    const pick = cls.find(cl => cl.st === 'hover');
    if (pick) { g.beginPath(); nodeShapePath(g, pick.x, pick.y, rad(pick), pick, false); g.lineWidth = 4; g.strokeStyle = rim; g.stroke(); }
    // Outer outline only: stroke every node, minus the inside of their union.
    g.lineWidth = (big ? 4 : 2.6) * 2;
    g.strokeStyle = big ? rim : rgba(...INK, dim ? dl : 0.9); g.strokeOutsideFill();
    const xs = b.nodes.map(c => c.x), ys = b.nodes.map(c => c.y);   // every node, grown or not, so the shading never shifts
    const [cx, cy] = toS((Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2);
    const ext = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 80 * S) * Z() / 2;
    cls.forEach(cl => { const [hx, hy] = toS(cl.x, cl.y); hatchList.push({ x: hx, y: hy, r: rad(cl) * Z(), R, G, B, dens: 1, a: dim ? (zoomKind ? DIM().far : DIM().hatch) : 1, pure: big, merged: { cx, cy, ext } }); });
  });
}

// Overlay on the visible canvas: the name label.
export function drawOverlay(dt) {
  const ldt = playing ? dt : 0;   // paused: particles hang where they are
  const dpr = devicePixelRatio || 1;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.font = `600 ${FONT}px ${MONO}`; ctx.textBaseline = 'top';
  ctx.save(); ctx.globalCompositeOperation = 'destination-over';   // the highlight fill sits behind the glyphs
  CATEGORIES.forEach(b => {
    const cls = b.nodes.filter(cl => !cl.hidden && cl.big != null);
    if (!cls.length) return;
    const [R, G, B] = TINT[b.kind], rs = cl => cl.r * cl.lift.a * cl.g * Z();
    if (b.kind === zoomKind) cls.forEach(cl => { const [sx, sy] = toS(cl.x, cl.y); nodeShapePath(ctx, sx, sy, rs(cl), cl); ctx.fillStyle = tone(R, G, B, cl.big ? DIM().big : cl.dim ? DIM().zfill : DIM().zrest); ctx.fill(); });
    else {
      ctx.beginPath(); cls.forEach(cl => { const [sx, sy] = toS(cl.x, cl.y); nodeShapePath(ctx, sx, sy, rs(cl), cl, false); });
      ctx.fillStyle = tone(R, G, B, cls[0].big ? DIM().big : cls[0].dim ? DIM().fill * (zoomKind ? 0.5 : 1) : DIM().rest); ctx.fill();
    }
  });
  ctx.restore();
  // Particles: now and then a particle drops from under a node and drifts down on the wind.
  CATEGORIES.forEach(b => b.nodes.forEach(cl => {
    const r = cl.r * cl.g;   // a growing node drops fewer particles, from under its current size
    if (cl.hidden || Math.random() > 0.04 * ldt * (r / 40)) return;
    particles.push({ x: cl.x + (Math.random() - 0.5) * r * 1.6, y: cl.y + r * 0.85, vx: (Math.random() - 0.3) * 20, vy: 5, ch: '*', c: TINT[b.kind] });
  }));
  for (let n = particles.length - 1; n >= 0; n--) {
    const p = particles[n]; p.vy = Math.min(20, p.vy + 60 * ldt); p.vx *= 1 - Math.min(1, 2 * ldt);
    p.x += (p.vx + wind(p.x, T) * 18) * ldt; p.y += p.vy * ldt;
    if (p.y > groundY) { particles.splice(n, 1); continue; }
    // Behind the node shape a particle fades out, and it fades back in as it falls clear.
    p.vis = (p.vis ?? 0) + ((inNodeShapes(p.x, p.y) ? 0 : 1) - (p.vis ?? 0)) * Math.min(1, dt * 6);
    if (p.vis < 0.02) continue;
    const [sx, sy] = toS(p.x, p.y), fade = Math.min(1, (groundY - p.y) / 40) * p.vis;
    // A particle is a shade darker than its category colour in light mode. In dark mode tone() swaps in the
    // category's dark-mode colour, which only works on the exact category colour.
    const k = DARK ? 1 : 0.85;
    ctx.fillStyle = tone(p.c[0] * k, p.c[1] * k, p.c[2] * k, 0.9 * fade);
    // A particle hops from cell to cell, like the glyphs around it.
    ctx.fillText(p.ch, Math.round(sx / cw - 0.5) * cw, Math.round(sy / LH - 0.5) * LH);
  }
  drawFeaturedMarkers();
  drawLabels();
}

// Featured markers: three @ glyphs on each category's featured project, else its newest. Featured markers on a category that is
// not zoomed fade with it, so it does not pull the eye away from the open one.
const FEATURED = new Set(CATEGORIES.map(b => (b.nodes.find(cl => cl.p.featured) || b.nodes[0]).p.id));   // b.nodes is newest first
function drawFeaturedMarkers() {
  ctx.save(); ctx.font = `700 15px ${MONO}`; ctx.textBaseline = 'middle';
  CATEGORIES.forEach(b => b.nodes.forEach(cl => {
    if (cl.hidden || cl.g < 0.9 || !FEATURED.has(cl.p.id)) return;
    const [x, y] = toS(cl.x, cl.y), r = cl.r * Z();
    ctx.globalAlpha = zoomKind && b.kind !== zoomKind ? 0.3 : 1;
    [[0.45, 0.35], [-0.35, 0.5], [0.05, 0.62]].forEach(([fx, fy], i) => {
      const bob = reduced ? 0 : Math.sin(T * 1.4 + i) * 1.2;
      ctx.fillStyle = BG; ctx.fillText('@', x + fx * r - 4, y + fy * r + bob + 1);
      ctx.fillStyle = tone(196, 30, 58); ctx.fillText('@', x + fx * r - 5, y + fy * r + bob);
    });
  }));
  ctx.restore();
}
// Name labels. Every name sits on its own node, so it cannot be read as a neighbour's name.
// If two names would touch, a name moves up or down within its node. If no height is clear, it waits until one is.
// Names are click targets too: clicking a name opens its project, never the node drawn under it.
// The split view beside an open project (VIEW set) has no names.
let labelKey = '', labelBoxes = [];
const SPOTS = [0, -14, 14, -28, 28].map(dy => ({ dy }));   // heights on the node, centre first
// Another node a name could be mistaken for. At the top level a click opens the whole category, so only other categories count.
const rival = (o, cl) => o !== cl && !o.hidden && (zoomKind ? o.p.kind === zoomKind : o.p.kind !== cl.p.kind);
function labelBox(s, spot) {
  const dy = Math.max(-0.6, Math.min(0.6, spot.dy / (s.r * PAY || 1))) * s.r * PAY;   // stay well inside small nodes
  const x0 = s.x - s.tw / 2 - 3, y0 = s.y + dy - 9;
  return { x0, y0, x1: x0 + s.tw + 6, y1: y0 + 18 };
}
function spotCost(box, s, discs, placed) {
  let cost = Math.abs(box.y0 + 9 - s.y) * 0.5;   // prefer the centre
  if (box.x0 < 4 || box.x1 > W - 4 || box.y0 < 4 || box.y1 > groundY) cost += 100;
  for (const q of placed) {
    const ox = Math.min(box.x1, q.x1) - Math.max(box.x0, q.x0) + 6, oy = Math.min(box.y1, q.y1) - Math.max(box.y0, q.y0) + 4;
    if (ox > 0 && oy > 0) cost += 1000;
  }
  // A spot nearer a rival node's edge than its own node's edge would read as the rival's name: never use it.
  const gap = o => { const nx = Math.max(box.x0, Math.min(box.x1, o.x)), ny = Math.max(box.y0, Math.min(box.y1, o.y)); return Math.hypot((nx - o.x) / (o.r * PAX), (ny - o.y) / (o.r * PAY)) - 1; };
  const own = gap(s);
  if (discs.some(o => rival(o.cl, s.cl) && gap(o) < own - 0.05)) cost += 1000;
  // Points across the box: each one over a rival node costs.
  for (let i = 0; i <= 5; i++) for (const fy of [0.15, 0.85]) {
    const px = box.x0 + (box.x1 - box.x0) * i / 5, py = box.y0 + (box.y1 - box.y0) * fy;
    for (const o of discs) if (rival(o.cl, s.cl) && ((px - o.x) / (o.r * PAX)) ** 2 + ((py - o.y) / (o.r * PAY)) ** 2 < 1) cost += 10;
  }
  return cost;
}
// A thick background-coloured outline under the letters clears the hatching just round each glyph.
function halo(s, x, y) { ctx.save(); ctx.strokeStyle = BG; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); ctx.restore(); }
function drawLabels() {
  const discs = [], shown = [];
  CATEGORIES.forEach(b => b.nodes.forEach(cl => {
    if (cl.hidden) return;
    // Full-grown size, so a name is placed once for where its node will end up.
    const [x, y] = toS(cl.x, cl.y), d = { cl, x, y, r: cl.r * Z() * cl.lift.a, live: !zoomKind || cl.p.kind === zoomKind };
    discs.push(d);
    // Zoomed, only the open category introduces names, so a name from a faded category never sits on the canvas.
    if (!VIEW && (cl.st || (cl.born != null && T - cl.born < 1.6 && (!zoomKind || b.kind === zoomKind)) || (zoomedIn(b.kind) && !phone()))) { d.tw = ctx.measureText(cl.p.name).width; shown.push(d); }   // new projects introduce themselves while growing
  }));
  const key = shown.map(d => d.cl.p.id).join() + '|' + zoomKind + '|' + W + 'x' + H + '|' + Math.round(Z() * 20);   // the camera may still be settling
  if (key !== labelKey) {   // the set of names changed: place them again, keeping a name's old spot while it stays clear
    labelKey = key;
    const placed = [];
    shown.sort((p, q) => (q.cl.spot ? 1 : 0) - (p.cl.spot ? 1 : 0) || p.y - q.y).forEach(d => {
      let best = null, bc = 1e9;
      if (d.cl.spot) { const c = spotCost(labelBox(d, d.cl.spot), d, discs, placed); if (c < 1000) { best = d.cl.spot; bc = c; } }
      if (!best) SPOTS.forEach(sp => { const c = spotCost(labelBox(d, sp), d, discs, placed); if (c < bc) { bc = c; best = sp; } });
      if (bc >= 1000) { d.cl.spot = null; return; }   // no clear height: wait
      d.cl.spot = best; placed.push(labelBox(d, best));
    });
    CATEGORIES.forEach(b => b.nodes.forEach(cl => { if (!shown.some(d => d.cl === cl)) cl.spot = null; }));
  }
  labelBoxes = [];
  ctx.textBaseline = 'middle';
  shown.forEach(d => {
    if (!d.cl.spot) {   // waiting for room: restart its intro clock so it still shows once placed
      if (!d.cl.st && !zoomKind) d.cl.born = T;
      return;
    }
    const box = labelBox(d, d.cl.spot), on = d.cl.st === 'hover' || d.cl.st === 'sel';
    const ink = on ? tone(...TINT[d.cl.p.kind]) : INKC();
    halo(d.cl.p.name, box.x0 + 3, box.y0 + 9);
    ctx.fillStyle = ink; ctx.fillText(d.cl.p.name, box.x0 + 3, box.y0 + 9);
    if (d.cl.st === 'sel') ctx.fillRect(box.x0 + 3, box.y0 + 16, d.tw, 1.5);   // underline marks the open project
    labelBoxes.push({ ...box, cl: d.cl });
  });
  // Nodes keep growing after their names are placed. If two names now touch, place them all again next frame.
  if (labelBoxes.some((q, n) => labelBoxes.some((o, m) => m > n && q.x0 < o.x1 && o.x0 < q.x1 && q.y0 < o.y1 && o.y0 < q.y1))) labelKey = '';
  // Hovering a whole category at the top level names it on the canvas, in its colour, over the middle of its mass.
  const hk = !zoomKind && (hoverKind || canvasKind), hb = hk && categoryOf(hk), hc = hb ? hb.nodes.filter(cl => !cl.hidden) : [];
  if (hc.length) {
    const pts = hc.map(cl => toS(cl.x, cl.y)), xs = pts.map(q => q[0]), ys = pts.map(q => q[1]);
    const s = `${hb.n} ${hb.name}/`, cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    ctx.font = `600 15px ${MONO}`; const tw = ctx.measureText(s).width, x0 = Math.max(4, Math.min(W - tw - 12, cx - tw / 2 - 4));
    halo(s, x0 + 4, cy);
    ctx.fillStyle = tone(...TINT[hk]); ctx.fillText(s, x0 + 4, cy);
  }
}
export const labelAt = (x, y) => { for (let n = labelBoxes.length - 1; n >= 0; n--) { const q = labelBoxes[n]; if (x >= q.x0 - 2 && x <= q.x1 + 2 && y >= q.y0 - 2 && y <= q.y1 + 2) return q.cl; } return null; };
