// Boot: the controls, the renderer, the resize and history listeners, and the frame loop.
import { categoryOf, byId } from './data.js';
import { createRenderer } from './renderer.js';
import { growNow, resize, setRenderer } from './glyphs.js';
import { setHint, setZoom } from './draw.js';
import { closeProject, frame, initUI, openP, openProject, setTop, setView, tick } from './ui.js';

initUI();
resize();
// A project page's breadcrumb links to /?zoom=<kind>, which opens that category. The parameter is then dropped from
// the address, so a reload after going back to all categories does not zoom in again.
const zoom = new URLSearchParams(location.search).get('zoom');
if (categoryOf(zoom)) { setZoom(zoom); history.replaceState(null, '', location.pathname + location.hash); }
addEventListener('resize', () => { document.body.classList.toggle('reading', !!openP && growNow()); setTop(); resize(); setView(); setHint(); });   // crossing 1024 px with a project open moves it
// The URL hash names the open project, so a link or a reload reopens it.
function fromHash() {
  const p = byId(location.hash.slice(1));
  if (p) { openProject(p.id, true); setZoom(p.kind); } else closeProject(true);
}
addEventListener('popstate', fromHash);
// The canvas font, the page load and the renderer can each change the canvas's size, so each one redraws it.
const redraw = () => { resize(); frame(0); };
document.fonts.ready.then(redraw);
addEventListener('load', () => { redraw(); if (location.hash) fromHash(); });
// Without WebGL 2 there is no canvas: the tree view lists every project and opens it.
createRenderer().then(st => {
  if (!st) { document.body.classList.add('no-gl'); return; }
  setRenderer(st); redraw();
});
requestAnimationFrame(tick);
