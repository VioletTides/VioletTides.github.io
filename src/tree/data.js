// Project and category data, colours and tones.
// The page holds src/data/projects.json as JSON in #site, with each slug as id. src/data/site.ts describes the fields.
const SITE = JSON.parse(document.getElementById('site').textContent);
export const PROJECTS = SITE.projects;
export const byId = id => PROJECTS.find(p => p.id === id);
// Each category of work comes from the categories list in src/data/projects.json. Everything else is computed.
export const CATEGORIES = SITE.categories;
// Number categories by their first project. The oldest is 1.
const first = b => Math.min(...PROJECTS.filter(p => p.kind === b.kind).map(p => p.year));
CATEGORIES.sort((a, b) => first(a) - first(b)).forEach((b, i) => { b.n = i + 1; });
// Each project's node on the canvas, with its springs. b.nodes is newest first, the order of the tree view.
CATEGORIES.forEach(b => {
  b.s = { a: 0, v: 0 };
  b.nodes = PROJECTS.filter(p => p.kind === b.kind).map((p, i) => ({ p, i, b, s: { a: 0, v: 0 }, sy: { a: 0, v: 0 }, lift: { a: 1, v: 0 } }))
    .sort((p, q) => q.p.year - p.p.year || p.i - q.i);   // newest first, the order of the tree view and the pager. i keeps the data order.
});
// Category areas sit on an arc over the trunk top, spread evenly from lower left to lower right. Lower slots go to
// older categories, so older growth sits low and newer growth high. Of two slots at one height, the right one goes first.
// cx, cy: the area's centre as fractions of the canvas. side: which side of the trunk it sits on.
export const TRUNK_X = 0.44;
{
  const N = CATEGORIES.length, A = 80 * Math.PI / 180;
  const slots = CATEGORIES.map((_, j) => N > 1 ? -A + 2 * A * j / (N - 1) : 0).sort((p, q) => Math.abs(q) - Math.abs(p) || q - p);
  CATEGORIES.forEach((b, i) => {
    const a = slots[i];
    b.cx = TRUNK_X + 0.21 * Math.sin(a); b.cy = 0.444 - 0.313 * Math.cos(a);
    b.side = b.cx < TRUNK_X - 1e-6 ? 'l' : 'r';
  });
}
export const hex = s => s.slice(1).match(/../g).map(h => parseInt(h, 16));   // '#rrggbb' -> [r, g, b]
export const TINT = Object.fromEntries(CATEGORIES.map(b => [b.kind, hex(b.light)]));
export const categoryOf = kind => CATEGORIES.find(b => b.kind === kind);
export const MONO = '"Source Code Pro", monospace';
// The text colour in each mode, the same colours as --ink in site.css.
export const INK = [28, 31, 36], INK_DARK = [228, 231, 226];
// Theme. Base.astro sets it before first paint, and theme.js changes it. Dark mode lifts every glyph colour to
// a bright tone of the same hue. BG: the background colour, for the halos under names and the featured marker.
export let DARK, BG;
function readTheme() {
  DARK = document.documentElement.dataset.theme === 'dark';
  BG = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
}
readTheme();
addEventListener('themechange', readTheme);
// In dark mode a category colour becomes its own dark-mode colour from CATEGORIES, the one the page text uses.
// Any other colour is lifted to a bright tone of the same hue.
const DARKOF = new Map(CATEGORIES.map(b => [hex(b.light).join(), hex(b.dark)]));
// Colours are rounded to steps of 12 and alpha to steps of 0.05, then cached, so neighbouring glyphs share one colour string.
const toneCache = new Map();
const quantTone = (r, g, b, a) => {
  const q = v => Math.max(0, Math.min(255, Math.round(v / 12) * 12));
  r = q(r); g = q(g); b = q(b); a = Math.round(Math.min(1, a) * 20) / 20;
  const key = ((r * 256 + g) * 256 + b) * 32 + a * 20;
  let c = toneCache.get(key);
  if (!c) { c = `rgba(${r},${g},${b},${a})`; toneCache.set(key, c); }
  return c;
};
export const tone = (r, g, b, a = 1) => {
  const dk = DARK && DARKOF.get([r, g, b].join());
  if (dk) [r, g, b] = dk;
  else if (DARK) { const k = 210 - Math.max(r, g, b); r += k; g += k; b += k; }
  return quantTone(r, g, b, a);
};
// Hatch strokes: the category colour of the current mode with a share m of that mode's text colour mixed in.
export const hatchTone = (R, G, B, m, a) => {
  const [r, g, b] = (DARK && DARKOF.get([R, G, B].join())) || [R, G, B], ink = DARK ? INK_DARK : INK;
  return quantTone(r + (ink[0] - r) * m, g + (ink[1] - g) * m, b + (ink[2] - b) * m, a);
};
// Faded alphas. Dark mode needs more, or faded parts vanish into the background.
// far: the categories that are not open while zoomed in, faded further so the open one reads alone.
// big: the highlight fill behind the highlighted node or category. 0.18 in dark mode keeps its glyphs at 4.5:1 or more.
// rest, zrest: the highlight fill of a category at rest, at all categories and zoomed in. Light mode needs more to read on the background.
// In light mode big stays at 0.24, so category-coloured hatching keeps 3:1 or more on its highlight fill (3.3:1 for work).
const DIM_DARK = { big: 0.18, hatch: 0.45, zhatch: 0.6, fill: 0.09, zfill: 0.1, line: 0.5, far: 0.22, rest: 0.14, zrest: 0.12 };
const DIM_LIGHT = { big: 0.24, hatch: 0.3, zhatch: 0.45, fill: 0.05, zfill: 0.06, line: 0.35, far: 0.13, rest: 0.2, zrest: 0.18 };
export const DIM = () => DARK ? DIM_DARK : DIM_LIGHT;
export const INKC = () => `rgb(${(DARK ? INK_DARK : INK).join()})`;
