// Category tabs, tree view, info panel, project page, the frame loop and the toolbar.
import { CATEGORIES, categoryOf, byId, TINT } from './data.js';
import { reduced } from './lib.js';
import { advance, growing, seek, STEP, stepOf, STEPS, Y0, Y1, YEAR, yearOf } from './timeline.js';
import { cv, cw, groundY, growNow, H, phone, canvas, rasterize, renderer, W } from './glyphs.js';
import { LH, SSX, SSY } from './renderer.js';
import { hatchList, particles, PAX, PAY } from './wood.js';
import { cam, drawOverlay, drawTree, HINT, labelAt, setHint, setZoom, toW, updateCam, Z, zoomKind } from './draw.js';

// Pointer and hover state. canvasKind: the category under the pointer on the canvas. hoverKind: the category tab or
// folder pointed at or focused. hoverId: the project pointed at. T: the animation clock, in seconds.
export let canvasKind = null, pointerS = null, hoverKind = null, hoverId = null, T = reduced ? 100 : 0;
let rowOn = null;   // the lit tree view row
// VIEW: the part of the canvas an open project leaves visible (the split view), as fractions of the canvas.
// Null: the whole canvas is visible.
export let VIEW = null;
// Pointing at or focusing a category tab or a folder lights that category.
function hoverable(el, kind) {
  el.addEventListener('pointerenter', () => { hoverKind = kind; }); el.addEventListener('focus', () => { hoverKind = kind; });
  el.addEventListener('pointerleave', () => { hoverKind = null; }); el.addEventListener('blur', () => { hoverKind = null; });
}
// ---------- Category tabs (real buttons) ----------
CATEGORIES.forEach(b => {
  const sw = document.createElement('button');
  sw.type = 'button'; sw.className = 'callout'; sw.style.setProperty('--k', `var(--${b.kind})`);
  sw.textContent = `${b.n} ${b.name}/`;   // the number backs up the colour for colour-blind visitors
  sw.setAttribute('aria-pressed', 'false');
  sw.addEventListener('click', () => { if (openP) closeProject(); setZoom(b.kind); });
  hoverable(sw, b.kind);
  document.getElementById('category-tabs').appendChild(sw); b.sw = sw;
});

// ---------- Tree view (plain, readable) ----------
const tree = document.getElementById('tree');
let html = `<li><span class="guide">~/robin</span></li>`;
CATEGORIES.forEach((b, bi) => {
  const lastB = bi === CATEGORIES.length - 1;
  html += `<li class="folder"><span class="guide">${lastB ? '`-- ' : '+-- '}</span><button type="button" data-folder="${b.kind}" aria-expanded="true" class="${b.kind}">${b.n} ${b.name}/</button></li>`;
  b.nodes.forEach((cl, ci) => {
    const last = ci === b.nodes.length - 1;
    html += `<li data-in="${b.kind}"><span class="guide">${lastB ? '    ' : '|   '}${last ? '`-- ' : '+-- '}</span><button type="button" data-id="${cl.p.id}" style="--k: var(--${b.kind})">${cl.p.name}</button><span class="meta">${Math.floor(cl.p.year)}</span></li>`;
  });
});
tree.innerHTML = html;
tree.querySelectorAll('[data-folder]').forEach(btn => {
  btn.addEventListener('click', () => {
    setZoom(zoomKind === btn.dataset.folder ? null : btn.dataset.folder);   // a folder is its category
  });
  hoverable(btn, btn.dataset.folder);
});
// At all categories every folder is open, so all project names show. Zoomed, only that category's folder is open.
export function syncFolders() {
  tree.querySelectorAll('[data-folder]').forEach(btn => {
    const open = !zoomKind || btn.dataset.folder === zoomKind;
    btn.setAttribute('aria-expanded', String(open));
    tree.querySelectorAll(`[data-in="${btn.dataset.folder}"]`).forEach(li => { li.hidden = !open; });
  });
  pinFolders();
}
// Pinned folder lines: ~/robin and the folders up to the open one stick to the top of the column, the folders after
// it to the bottom, so all 4 stay in view however long the open folder is.
function pinFolders() {
  const root = tree.firstElementChild, rh = root.offsetHeight, fs = [...tree.querySelectorAll('.folder')];
  const oi = Math.max(0, fs.findIndex(li => li.querySelector('button').dataset.folder === zoomKind)), fh = fs[0].offsetHeight;
  root.style.top = '0px';
  fs.forEach((li, i) => {
    li.style.top = i <= oi ? `${rh + i * fh}px` : '';
    li.style.bottom = i > oi ? `${(fs.length - 1 - i) * fh}px` : '';
  });
}
tree.querySelectorAll('[data-id]').forEach(btn => {
  btn.addEventListener('click', () => { const p = byId(btn.dataset.id); reveal(p); openProject(p.id, false, btn); setZoom(p.kind); });
  btn.addEventListener('pointerenter', () => { hoverId = btn.dataset.id; });
  btn.addEventListener('pointerleave', () => { hoverId = null; });
  btn.addEventListener('focus', () => {   // keyboard focus zooms to the project's category and lights its node
    const p = byId(btn.dataset.id);
    reveal(p); if (zoomKind !== p.kind) setZoom(p.kind);
    hoverId = p.id;
  });
  btn.addEventListener('blur', () => { hoverId = null; });
});

// The info panel always sits at the canvas's bottom right. It shows the hovered category or project, else the hint.
// Zoomed, the camera keeps the info panel's column clear (updateCam in draw.js), so the info panel never hides a name.
const info = document.getElementById('info');
let infoOn = null, closingId = null;
const infoNode = () => zoomKind && byId(hoverId || closingId || (openP && openP.id));
// What the info panel shows: a project, a category or the hint. Zoomed, another category under the pointer shows that category.
function infoHTML() {
  const k = canvasKind || hoverKind, p = zoomKind ? infoNode() : byId(hoverId);
  const b = categoryOf(p ? p.kind : zoomKind && k === zoomKind ? null : k);
  if (p) return [b, `<h2>${p.name}</h2><p>${b.name}, ${Math.floor(p.year)}</p><p class="what">${p.what}</p>${zoomKind ? '<p class="go">click to open</p>' : ''}`];
  if (b) { const ys = b.nodes.map(c => c.p.year); return [b, `<h2>${b.name}/</h2><p>${b.nodes.length} projects, ${Math.floor(Math.min(...ys))} to ${Math.floor(Math.max(...ys))}</p>`]; }
  if (growNow()) return [null, `<p>${zoomKind ? 'Click a project to open it.' : HINT}</p>`];   // from 1024 px up the info panel is the hint
  return [null, `<p>Point at a category or a project to see what it is.</p>`];
}
function syncInfo() {
  const [b, html] = infoHTML();
  if (html === infoOn) return;
  infoOn = html;
  info.style.setProperty('--k', b ? `var(--${b.kind})` : 'var(--ink)');
  info.classList.toggle('idle', !b);   // the idle info panel is only the hint, so it stays small
  info.innerHTML = html;
}
// The info panel covers that corner of the canvas. Under the info panel, the pointer reaches only what the info panel shows, so a
// click there acts on the info panel. Without this, an info panel growing over the pointer would drop the hover, shrink and flicker.
function underInfo(sx, sy) {
  if (!info.offsetWidth || document.body.classList.contains('reading')) return false;
  const c = info.getBoundingClientRect(), v = cv.getBoundingClientRect(), x = v.left + sx, y = v.top + sy;
  return x >= c.left && x <= c.right && y >= c.top && y <= c.bottom;
}
function pickAt(sx, sy) {
  const cl = labelAt(sx, sy) || nodeAt(toW(sx, sy));
  if (!cl || !underInfo(sx, sy)) return cl;
  return cl.p.id === hoverId || cl.p.kind === canvasKind ? cl : null;
}

// Canvas interaction: hovering a node lights its row, and clicking opens it.
function nodeAt(p) {
  let best = null, bd = 1e9;
  CATEGORIES.forEach(b => b.nodes.forEach(cl => { if (cl.hidden) return; const d = Math.hypot((p.x - cl.x) / PAX * 1.08, (p.y - cl.y) / PAY * 0.92); if (d < cl.r && d < bd) { bd = d; best = cl; } }));
  return best;
}
function hoverFromPointer() {
  if (VIEW) { hoverId = canvasKind = null; cv.style.cursor = 'default'; return; }   // the split view beside an open project is drawing only: the tree view navigates
  const cl = pickAt(pointerS.x, pointerS.y);
  hoverId = cl && zoomKind === cl.p.kind ? cl.p.id : null;   // inside the open category: one project
  canvasKind = cl && zoomKind !== cl.p.kind ? cl.p.kind : null;   // otherwise: the whole category
  cv.style.cursor = cl ? 'pointer' : 'default';
}
// The lit tree view row follows hoverId. frame() calls this after it recomputes the hover, so the row keeps up during a zoom.
function syncRows() {
  if (hoverId === rowOn) return;
  rowOn = hoverId; tree.querySelectorAll('[data-id]').forEach(b => b.classList.toggle('on', b.dataset.id === hoverId));
}

// ---------- Project page ----------
// A project opened or focused before its node has grown: finish the growth, so the canvas has something to show.
function reveal(p) { if (STEP < p.step + 1.9) seek(STEPS); }
export let openP = null;
// From 1024 px up an open project leaves the left SPLIT of the canvas drawn, with the camera on its category. The
// split view is drawing only: the tree view moves between projects.
const SPLIT = 0.34;
export function setView() {
  if (!openP || !growNow()) { VIEW = null; return; }
  VIEW = { x0: 0, y0: 0, x1: SPLIT, y1: 1 };
  mainEl.style.setProperty('--split', `${Math.round(SPLIT * cv.clientWidth)}px`);
}
export function openProject(id, fromHistory, fromEl) {
  const p = byId(id);
  reveal(p);
  if (!fromHistory && location.hash !== '#' + id) {   // switching projects replaces the entry, so back always closes
    if (openP) history.replaceState(history.state, '', '#' + id); else history.pushState({ pushed: true }, '', '#' + id);
  }
  const wasOpen = !!openP;
  openP = p;
  tree.querySelectorAll('[data-id]').forEach(b => b.setAttribute('aria-current', String(b.dataset.id === id)));
  const sec = document.getElementById('project');
  sec.style.setProperty('--k', `var(--${p.kind})`);
  sec.replaceChildren(document.getElementById(`p-${id}`).content.cloneNode(true));   // index.astro renders each page
  setView();
  sec.querySelectorAll('[data-crumb]').forEach(btn => btn.addEventListener('click', () => { closeProject(); setZoom(btn.dataset.crumb || null); }));
  sec.querySelector('.x').addEventListener('click', () => closeProject());
  // From 1024 px up the project covers the canvas right of the split view, under the category tabs. Narrower, it opens under the toolbar.
  const reading = growNow(), animate = reading && !wasOpen && !reduced;
  clearTimeout(swapTimer); closingId = null;
  sec.classList.remove('grow-in', 'grow-out', 'growing', 'swap'); ghost.hidden = true;
  const show = () => {
    if (openP !== p) return;
    setTop(); document.body.classList.toggle('reading', reading);
    sec.hidden = false; sec.scrollTop = 0;
    if (wasOpen && !reduced) { sec.classList.remove('swap'); sec.offsetWidth; sec.classList.add('swap'); }   // prev and next: the new page rises in
    sec.querySelector('h2').focus({ preventScroll: true });
  };
  if (!animate) show();
  else {   // the frame grows from the info panel (or the clicked tree view row) to the project's box. The page sits above it,
    // see-through, and fades in as the frame finishes, so the two overlap and nothing cuts.
    setTop(); document.body.classList.add('reading'); sec.hidden = false; sec.classList.add('growing');
    growFrame(sec, true, p.kind, fromEl);
    swapTimer = setTimeout(() => { show(); sec.classList.add('grow-in');
      swapTimer = setTimeout(() => { sec.classList.remove('grow-in', 'growing'); ghost.hidden = true; }, 240); }, 200);
  }
  frame(0);
}
const mainEl = document.getElementById('main-area');
let swapTimer = 0;
// The project's top edge: the bottom of the category tabs, in the main area.
// --bot: from the top of the canvas's bottom rule to the main area's bottom, so the page stops on the rule, the rule is
// its bottom line, and the toolbar stays.
export function setTop() {
  const s = mainEl.getBoundingClientRect(), rule = parseFloat(getComputedStyle(canvas).borderBottomWidth) || 0;
  mainEl.style.setProperty('--top', `${document.getElementById('category-tabs').getBoundingClientRect().bottom - s.top}px`);
  mainEl.style.setProperty('--bot', `${s.bottom - canvas.getBoundingClientRect().bottom + rule}px`);
}
// The frame grows from the info panel's box (or a tree view row's) to the project's box (open), or shrinks back into the
// info panel (close). It carries the info panel's border and text, and the text fades as the frame grows. The open page keeps the
// same frame, so the hand-over has no cut.
const ghost = document.createElement('div'); ghost.className = 'ghost'; ghost.hidden = true; ghost.setAttribute('aria-hidden', 'true'); mainEl.appendChild(ghost);
function growFrame(sec, open, kind, fromEl) {
  const s = mainEl.getBoundingClientRect(), c = (fromEl || info).getBoundingClientRect(), r = sec.getBoundingClientRect();
  const at = q => `left: ${q.left - s.left}px; top: ${q.top - s.top}px; width: ${q.width}px; height: ${q.height}px;`;
  ghost.innerHTML = fromEl ? '' : `<div class="ghost-text" style="width: ${info.clientWidth - 40}px">${info.innerHTML}</div>`;
  ghost.style.setProperty('--k', `var(--${kind})`);
  ghost.classList.toggle('closing', !open); ghost.hidden = false;
  ghost.style.transition = 'none'; ghost.style.cssText += at(open ? c : r);
  ghost.offsetWidth;   // apply the start box before the transition
  ghost.style.transition = ''; ghost.style.cssText += at(open ? r : c);
}
export function closeProject(fromHistory) {
  if (!openP) return;
  if (fromHistory !== true) {
    if (history.state?.pushed) { history.back(); return; }   // popstate finishes the close
    history.replaceState(null, '', location.pathname + location.search);   // arrived on a project link: nothing to go back to
  }
  const sec = document.getElementById('project'), id = openP.id, openKind = openP.kind, hadFocus = sec.contains(document.activeElement);
  const wasReading = document.body.classList.contains('reading');
  openP = null; clearTimeout(swapTimer); VIEW = null;
  tree.querySelectorAll('[data-id]').forEach(b => b.setAttribute('aria-current', 'false'));
  const hide = () => {
    if (openP) return;   // another project opened meanwhile
    sec.hidden = true; sec.innerHTML = '';
    sec.classList.remove('grow-out'); document.body.classList.remove('reading'); closingId = null; syncInfo();
  };
  sec.classList.remove('grow-in');
  if (!wasReading || reduced) hide();
  else {   // the page fades, then the frame shrinks back into the info panel, which shows the closed project until the end
    closingId = id; syncInfo(); sec.classList.add('grow-out');
    swapTimer = setTimeout(() => { growFrame(sec, false, openKind); sec.hidden = true;   // measure the page's box before hiding it
      swapTimer = setTimeout(() => { ghost.hidden = true; hide(); }, 230); }, 120);
  }
  frame(0);
  if (hadFocus) tree.querySelector(`[data-id="${id}"]`).focus({ preventScroll: true });
}

// ---------- Loop ----------
export let playing = !reduced;
let last = 0, tlOn = null;
export function frame(dt) {
  // The renderer draws the tree. While it starts, or without WebGL 2, there is nothing to draw.
  const st = renderer;
  if (!st) return;
  const g = st.paths;
  updateCam(dt);
  if (pointerS) hoverFromPointer();
  syncRows();
  const kx = SSX / cw, ky = SSY / LH, z = Z();
  g.setTransform(kx * z, 0, 0, ky * z, kx * (W / 2 - (W / 2 + cam.x.a) * z), ky * (H / 2 - (H / 2 + cam.y.a) * z));
  advance(dt);
  if (YEAR !== tlOn) { tlOn = YEAR; tl.value = YEAR; }   // a slider write restyles it, so it only happens when the year moves
  syncYear();
  // Screen readers hear "spring 2024", not "2024.37".
  const yText = `${['winter', 'spring', 'summer', 'fall'][Math.min(3, Math.floor((YEAR % 1) * 4))]} ${Math.floor(YEAR)}`;
  if (tl.getAttribute('aria-valuetext') !== yText) tl.setAttribute('aria-valuetext', yText);
  hatchList.length = 0;
  drawTree(g, T, dt); rasterize(st); drawOverlay(dt);
}
// The first frames that draw nodes, names and particles make Firefox compile GPU shaders and cache glyphs, which
// stalled the growth for 150 to 450 ms as the first project appeared. warmUp() draws the grown tree once before the
// growth starts. The real frame drawn right after it in the same task is the one that reaches the screen.
function warmUp() {
  const s = STEP, play = growing; seek(STEPS);   // a frame at the last step ends the growth, so growing is put back too
  particles.push({ x: W / 2, y: groundY - 30, vx: 0, vy: 0, ch: '*', c: TINT[CATEGORIES[0].kind], vis: 1 });
  frame(0);
  seek(s, play); particles.length = 0;
  CATEGORIES.forEach(b => b.nodes.forEach(cl => { cl.born = null; cl.spot = null; }));
  frame(0);
}
// The canvas only draws while some of it is on screen and the tab is visible.
let onScreen = true;
// The growth starts once the page has loaded and the renderer is up (it waits for the canvas font). warmUp() then
// runs, and the growth waits for 10 refreshes in a row under 25 ms apart. So the warm-up's shader compiles and late
// loading work land on the empty canvas, not on the first second of growth. After 4 s it starts anyway.
let started = false, warm = false, waitFrom = null, calm = 0, prevNow = 0, restKey = '', restUntil = 0;
let pageReady = document.readyState === 'complete';
if (!pageReady) addEventListener('load', () => { pageReady = true; }, { once: true });
// On a screen above 100 Hz the canvas draws every second refresh, so a 144 Hz screen does not run the whole frame
// 144 times a second. Up to 100 Hz it draws every refresh: a 60 a second cap on a 75 Hz screen skipped every fifth
// refresh, which made the motion judder. Motion scales with dt, so skipped refreshes only lower the frame rate.
let refresh = 16.7, drawnAt = 0;
export function tick(now) {
  const gap = prevNow ? now - prevNow : 16.7; prevNow = now;
  if (gap > 3) refresh += (gap - refresh) * (gap < refresh ? 0.2 : 0.01);   // follows the shortest gaps, so late refreshes barely move it
  if (!started) {
    waitFrom ??= now;
    calm = gap < 25 ? calm + 1 : 0;
    const ready = pageReady && renderer;
    if (ready && !warm) { warm = true; warmUp(); calm = 0; }
    if (!ready) calm = 0;
    if (calm < 10 && now - waitFrom < 4000) { requestAnimationFrame(tick); return; }
    if (!warm) warmUp();
    started = true; last = 0;
    if (reduced) for (let k = 0; k < 60; k++) frame(0.016);   // the springs settle before the first still frame
  }
  if (refresh < 10 && now - drawnAt < refresh * 1.5) { requestAnimationFrame(tick); return; }
  drawnAt = now;
  const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016); last = now;
  syncInfo();
  const vis = onScreen && !document.hidden;
  if (playing) { T += dt; if (vis) frame(dt); }
  else if (vis) {   // paused: the canvas still answers clicks and hovers, redraws while the view settles, then rests
    const k = [zoomKind, openP && openP.id, hoverId, hoverKind, canvasKind, W, H].join();
    if (k !== restKey) { restKey = k; restUntil = now + 1500; }
    if (now < restUntil) frame(dt);
  }
  requestAnimationFrame(tick);
}
const tl = document.getElementById('tl');
tl.min = Y0; tl.max = Y1; tl.value = yearOf(STEP);   // without a value, a range input shows its midpoint until the first frame
const years = document.getElementById('years');
for (let y = Math.ceil(Y0); y <= Math.floor(Y1); y++) years.insertAdjacentHTML('beforeend', `<span data-y="${y}" style="left: ${(100 * (y - Y0) / (Y1 - Y0)).toFixed(2)}%">${y}</span>`);
let yrOn = null;
function syncYear() { const y = Math.floor(YEAR); if (y === yrOn) return; yrOn = y; years.querySelectorAll('span').forEach(s => s.classList.toggle('now', +s.dataset.y === y)); }
tl.addEventListener('input', () => { seek(stepOf(+tl.value)); frame(0); });
// Replay restarts the growth and keeps the pause state.
document.getElementById('tlplay').addEventListener('click', () => { seek(0, true); frame(0); });
// theme.js owns dark mode switch, and data.js reads the new theme. The canvas redraws.
addEventListener('themechange', () => frame(0));
const motionBtn = document.getElementById('motion');
function setPlaying(on) { playing = on; motionBtn.textContent = on ? 'Pause' : 'Play'; }
motionBtn.addEventListener('click', () => { setPlaying(!playing); frame(0); });
setPlaying(playing);

// Setup that reaches into the other modules, so main.js runs it once they have all loaded.
export function initUI() {
  syncFolders(); setHint();
  cv.addEventListener('pointermove', e => {
    const r = cv.getBoundingClientRect(); pointerS = { x: e.clientX - r.left, y: e.clientY - r.top };
    hoverFromPointer(); syncRows();
  });
  cv.addEventListener('pointerleave', () => { pointerS = canvasKind = null; hoverId = null; syncRows(); });
  cv.addEventListener('click', e => { if (VIEW) return; const r = cv.getBoundingClientRect(), sx = e.clientX - r.left, sy = e.clientY - r.top; const cl = pickAt(sx, sy); if (cl) {
      if (zoomKind === cl.p.kind && phone()) { hoverId = cl.p.id; syncRows(); }   // phones: point at the project's row
      else if (zoomKind === cl.p.kind) openProject(cl.p.id);   // second click: the project
      else { setZoom(cl.p.kind); canvasKind = null; }   // first click: the category
    } else if (zoomKind && !underInfo(sx, sy)) setZoom(null); });   // a click on the bare info panel does nothing
  new IntersectionObserver(es => { onScreen = es[es.length - 1].isIntersecting; }).observe(canvas);
}
