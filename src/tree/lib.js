// Shared helpers: the reduced-motion setting and two maths helpers.

export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const clamp01 = v => Math.max(0, Math.min(1, v));
export const eo = t => 1 - (1 - t) ** 3;   // ease-out
