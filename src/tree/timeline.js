// The timeline animation. Every project gets one equal step, in start-date order (ties in data order), so projects
// arrive at an even beat however far apart their dates are. The trunk gets 3 steps first, and the last project 2
// steps to finish. The slider and the year labels map STEP to the year in a straight line through the first and the
// last project's dates, so the thumb moves at an even speed. The year it shows between them is close, not exact.
import { CATEGORIES, PROJECTS } from './data.js';
import { clamp01, reduced } from './lib.js';

const GROW_S = 6;   // seconds for the whole growth
const order = PROJECTS.map((p, i) => [p, i]).sort((a, b) => a[0].year - b[0].year || a[1] - b[1]).map(([p]) => p);
order.forEach((p, k) => { p.step = k + 3; });
CATEGORIES.forEach(b => { b.first = Math.min(...b.nodes.map(c => c.p.step)); });   // the category's first project
export const STEPS = order.length + 4;
const perStep = (order.at(-1).year - order[0].year) / (order.length - 1);   // years per step
export const Y0 = order[0].year - 3 * perStep, Y1 = Y0 + STEPS * perStep;
export const stepOf = y => clamp01((y - Y0) / (Y1 - Y0)) * STEPS;
export const yearOf = st => Y0 + (Y1 - Y0) * clamp01(st / STEPS);
// STEP: where the growth is. growing: whether it moves on by itself.
export let STEP = reduced ? STEPS : 0, YEAR = yearOf(STEP), growing = !reduced;

// Jumps to a step. The growth carries on from there only if play is set.
export function seek(step, play = false) { STEP = step; growing = play; }
export function advance(dt) {
  if (growing) { STEP = Math.min(STEPS, STEP + dt * STEPS / GROW_S); if (STEP >= STEPS) growing = false; }
  YEAR = yearOf(STEP);
}
