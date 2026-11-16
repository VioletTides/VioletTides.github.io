// Builds the limbs and twigs after the nodes, and draws wood, growth tips, node shapes and hatching.
// The wood is built after the nodes, so it always reaches its own nodes. The categories on each side of the trunk
// share one limb from it, and a category straight above the trunk gets its own limb from the top. Then each category's group of nodes is split in two, again and again, by angle as seen from the
// fork, keeping each half tight. Each half gets a sub-limb toward its centre that stops before its nearest node,
// so every limb and twig leans outward. A group of one node gets a twig.
// Wood node: { group, kids, k }, or a leaf { cl } that holds one project node. A wood node sits a fraction k of the way from its parent to its group's centre.
import { CATEGORIES, INK, TINT, TRUNK_X } from './data.js';
import { cw, S } from './glyphs.js';
import { LH } from './renderer.js';
import { mean, rgba, trunkGeo, trunkH } from './layout.js';

const KMIN = 0.08;   // shortest sub-limb, as a share of the way to its group's centre
export let WOOD = [];
const GW = 3.5;   // most steps a new stretch of wood may take to grow
export function buildWood() {
  const X = c => c.b.x + c.ox, Y = c => c.b.y + c.oy, geo = trunkGeo(1);
  const node = (px, py, grp) => {
    if (grp.length === 1) return { cl: grp[0], group: grp, kids: [] };
    const cx = mean(grp, X), cy = mean(grp, Y), L = Math.hypot(cx - px, cy - py) || 1, ux = (cx - px) / L, uy = (cy - py) / L;
    const near = Math.min(...grp.map(c => (X(c) - px) * ux + (Y(c) - py) * uy));
    const k = Math.max(KMIN, Math.min(0.55, 0.6 * near / L)), nx = px + (cx - px) * k, ny = py + (cy - py) * k;
    // Split by angle round the new fork, at the cut that leaves the two halves tightest.
    const base = Math.atan2(cy - ny, cx - nx), ang = c => { const a = Math.atan2(Y(c) - ny, X(c) - nx) - base; return Math.atan2(Math.sin(a), Math.cos(a)); };
    const srt = [...grp].sort((p, q) => ang(p) - ang(q));
    const sse = gs => { const mx = mean(gs, X), my = mean(gs, Y); return gs.reduce((a, c) => a + (X(c) - mx) ** 2 + (Y(c) - my) ** 2, 0); };
    let cut = 1, bv = Infinity;
    for (let i = 1; i < srt.length; i++) { const v = sse(srt.slice(0, i)) + sse(srt.slice(i)); if (v < bv) { bv = v; cut = i; } }
    return { group: grp, k, kids: [srt.slice(0, cut), srt.slice(cut)].map(gs => node(nx, ny, gs)) };
  };
  const sideOf = b => b.side === 'l' ? -1 : Math.abs(b.cx - TRUNK_X) < 1e-6 ? 0 : 1;
  WOOD = [-1, 0, 1].map(side => CATEGORIES.filter(b => sideOf(b) === side && b.nodes.length)).filter(bs => bs.length).map(bs => {
    const cls = bs.flatMap(b => b.nodes), side = sideOf(bs[0]), [ox, oy] = geo.O[side];
    const k = 0.4, fx = ox + (mean(cls, X) - ox) * k, fy = oy + (mean(cls, Y) - oy) * k;
    return { group: cls, k, side, kids: bs.map(b => node(fx, fy, b.nodes)) };
  });
  // Growth timing, in steps. Each node's path of wood must be grown just as the node appears (0.1 steps before
  // its own step). Taking nodes in arrival order, the part of the path no earlier node needed grows at an even
  // speed, from where the grown wood ends. So no limb grows further than a node needs.
  WOOD.forEach(root => {
    placeWood(root, ...geo.O[root.side], X, Y);
    // A sub-limb shorter than 12 px is merged into its parent, which then forks three or more ways.
    const merge = n => { n.kids = n.kids.flatMap(q => !q.cl && q.len < 12 * S ? q.kids : [q]); if (n.kids.some(q => !q.cl && q.len < 12 * S)) merge(n); else n.kids.forEach(merge); };
    merge(root);
    placeWood(root, ...geo.O[root.side], X, Y);
    // A twig that would turn more than 70 degrees from its limb moves to the nearest limb up the tree that lets it
    // leave at 60 degrees, partway along. It then leans outward instead of growing back toward the trunk.
    const leaves = [], climb = (n, chain) => { if (n.cl) leaves.push([n, chain]); n.kids.forEach(q => climb(q, [n, ...chain])); };
    climb(root, []);
    leaves.forEach(([n, chain]) => {
      const turnFrom = (A, px, py) => { const vx = A.x - A.px, vy = A.y - A.py, L = Math.hypot(vx, vy) || 1; return ((n.x - px) * vx + (n.y - py) * vy) / ((Math.hypot(n.x - px, n.y - py) || 1) * L); };
      if (turnFrom(chain[0], chain[0].x, chain[0].y) >= Math.cos(70 * Math.PI / 180)) return;
      for (const A of chain) {
        const vx = A.x - A.px, vy = A.y - A.py, L = Math.hypot(vx, vy) || 1, ux = vx / L, uy = vy / L;
        const f = ((n.x - A.px) * ux + (n.y - A.py) * uy), dp = Math.abs((n.x - A.px) * uy - (n.y - A.py) * ux);
        const at = (f - dp / Math.tan(60 * Math.PI / 180)) / L;
        if (at < 0.15) continue;
        const old = chain[0]; old.kids = old.kids.filter(q => q !== n);
        for (const c of chain) { if (c === A) break; c.group = c.group.filter(cl => cl !== n.cl); }
        A.kids.push(n); n.a = Math.min(1, at);
        break;
      }
    });
    // A limb left with no nodes is dropped.
    const prune = n => { n.kids = n.kids.filter(q => q.cl || q.group.length); n.kids.forEach(prune); };
    prune(root);
    placeWood(root, ...geo.O[root.side], X, Y);
    const paths = [], walk = (n, path) => { path = [...path, n]; if (n.cl) paths.push(path); n.kids.forEach(q => walk(q, path)); };
    walk(root, []);
    paths.sort((p, q) => p.at(-1).cl.p.step - q.at(-1).cl.p.step || p.at(-1).cl.p.i - q.at(-1).cl.p.i);
    paths.forEach(path => {
      const i = path.findIndex(n => n.s == null), tc = path.at(-1).cl.p.step - 0.1;
      if (i < 0) return;
      // Lengths are measured with the trunk as tall as it is when this wood grows. The limbs start from the trunk top,
      // so early wood is longer on screen than in the grown tree.
      placeWood(root, ...trunkGeo(trunkH(tc)).O[root.side], X, Y);
      const t0 = i === 0 ? Math.max(1.5, tc - GW) : Math.max(path[i - 1].e, tc - GW);
      const rest = path.slice(i), total = rest.reduce((a, n) => a + n.len, 0) || 1;
      let run = 0;
      rest.forEach(n => { n.s = t0 + (tc - t0) * run / total; run += n.len; n.e = t0 + (tc - t0) * run / total; });
    });
    placeWood(root, ...geo.O[root.side], X, Y);
  });
}
// Positions of every node, from the node positions given by X and Y. Sets n.x, n.y, its parent end n.px, n.py and n.len.
export function placeWood(n, px, py, X, Y, par) {
  if (n.a != null && par) { px = par.px + (par.x - par.px) * n.a; py = par.py + (par.y - par.py) * n.a; }
  if (n.cl) { n.x = X(n.cl); n.y = Y(n.cl); } else { n.x = px + (mean(n.group, X) - px) * n.k; n.y = py + (mean(n.group, Y) - py) * n.k; }
  n.px = px; n.py = py; n.len = Math.hypot(n.x - px, n.y - py);
  n.kids.forEach(q => placeWood(q, n.x, n.y, X, Y, n));
}

// A growth tip: a small dot in the category colour on the growing end of a limb or twig, and on a grown twig whose node
// has not appeared yet. It sits on the same curve as limb(), so it rides the tip.
export function growthTip(g, n, bend) {
  const t = n.t, waiting = n.cl && n.cl.hidden && t >= 1;
  if (!(t > 0 && t < 1) && !waiting) return;
  const dx = n.x - n.px, dy = n.y - n.py, L = Math.hypot(dx, dy) || 1, cx = (n.px + n.x) / 2 - dy / L * bend, cy = (n.py + n.y) / 2 + dx / L * bend, u = 1 - t;
  const x = u * u * n.px + 2 * u * t * cx + t * t * n.x, y = u * u * n.py + 2 * u * t * cy + t * t * n.y;
  const k = n.group[0].p.kind, [R, G, B] = n.group.every(c => c.p.kind === k) ? TINT[k] : INK;   // a limb that carries several categories growth tips in ink
  g.fillStyle = rgba(R, G, B, 0.95); g.beginPath();   // a 12-sided dot: the GPU path context has no arc()
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.lineTo(x + Math.cos(a) * 7 * S, y + Math.sin(a) * 7 * S); }
  g.closePath(); g.fill();
}
// A tapered, slightly curved limb drawn as a filled shape.
export function limb(g, x0, y0, x1, y1, w0, w1, bend, alpha, t = 1) {
  if (t <= 0) return;
  let dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  let cx = (x0 + x1) / 2 + nx * bend, cy = (y0 + y1) / 2 + ny * bend;
  if (t < 1) {   // split the curve at t: the grown part keeps the final shape
    const u = 1 - t;
    x1 = u * u * x0 + 2 * u * t * cx + t * t * x1; y1 = u * u * y0 + 2 * u * t * cy + t * t * y1;
    cx = x0 + (cx - x0) * t; cy = y0 + (cy - y0) * t;
    w1 = (w0 + (w1 - w0) * t) * 0.3;
    dx = x1 - x0; dy = y1 - y0; L = Math.hypot(dx, dy) || 1; nx = -dy / L; ny = dx / L;
  }
  const wm = (w0 + w1) / 4;
  g.fillStyle = rgba(...INK, alpha);
  g.beginPath();
  g.moveTo(x0 + nx * w0 / 2, y0 + ny * w0 / 2);
  g.quadraticCurveTo(cx + nx * wm, cy + ny * wm, x1 + nx * w1 / 2, y1 + ny * w1 / 2);
  g.lineTo(x1 - nx * w1 / 2, y1 - ny * w1 / 2);
  g.quadraticCurveTo(cx - nx * wm, cy - ny * wm, x0 - nx * w0 / 2, y0 - ny * w0 / 2);
  g.closePath(); g.fill();
}

// Scalloped node shape edge: lobes around the centre, fixed per node.
export function nodeShapePath(g, x, y, r, cl, fresh = true) {
  const n = 7 + Math.round(cl.r / 14);
  if (fresh) g.beginPath();
  for (let k = 0; k <= n; k++) {
    const a0 = (k / n) * Math.PI * 2, a1 = ((k + 0.5) / n) * Math.PI * 2, a2 = ((k + 1) / n) * Math.PI * 2;
    const rr = r * (0.88 + 0.12 * Math.sin(k * 2.3 + cl.i * 5));
    const p = a => [x + Math.cos(a) * rr * PAX, y + Math.sin(a) * rr * PAY];
    const [x0, y0] = p(a0), [x2, y2] = p(a2);
    if (!k) g.moveTo(x0, y0);
    if (k < n) g.quadraticCurveTo(x + Math.cos(a1) * rr * PAX * 1.25, y + Math.sin(a1) * rr * PAY * 1.25, x2, y2);
  }
  g.closePath();
}

// Hatching is placed straight onto the glyph grid (see hatchAt), so every stroke is one clean diagonal glyph.
export const hatchList = [], particles = [];
export const PAX = 1.08, PAY = 0.92;
export function hatchAt(c, r, list) {
  const px = (c + 0.5) * cw, py = (r + 0.5) * LH;
  for (let n = list.length - 1; n >= 0; n--) {
    const h = list[n];
    if (c < h.c0 || c > h.c1) continue;
    const dx = (px - h.x) / (h.r * PAX), dy = (py - h.y) / (h.r * PAY);
    if (dx * dx + dy * dy > (h.merged ? 0.8 : 0.62)) continue;
    const hc = h.merged ? 0 : Math.round(h.x / cw), hr = h.merged ? 0 : Math.round(h.y / LH), sp = h.dens === 2 ? 2 : 3;
    const a = h.dens && ((c - r - hc + hr) % sp + sp) % sp === 0;
    const shade = h.dens === 2 || (h.merged ? (px - h.merged.cx + py - h.merged.cy) / h.merged.ext > 0.35 : dx + dy > 0.2);     // shadow side, lower right
    const b = h.dens && shade && ((c + r - hc - hr) % sp + sp) % sp === 0;
    return { ch: a && b ? 'X' : a ? '\\' : b ? '/' : ' ', h };
  }
  return null;
}
