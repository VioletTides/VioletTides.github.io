// The renderer, in plain WebGL 2. gpu-path.js draws the tree into an ink texture, then two full-screen passes:
// 1. one fragment per cell picks the cell's glyph and colour, into two cols x rows textures.
// 2. each screen pixel stamps its cell's glyph from an atlas drawn at device pixels.
import { createPathContext, program } from './gpu-path.js';

// FONT: the canvas font size in px. LH: the cell height. SSX, SSY: ink texels per cell.
export const FONT = 13, LH = 15, SSX = 8, SSY = 16;
const CSS_FONT = `600 ${FONT}px "Source Code Pro"`;
// The first 13 glyphs are fixed, because pass 1 picks them by index. The tree also writes ~ and X.
const GLYPHS = ' .:-=+*#%@\\|/_,\'~^()<>xX';

// Resolves to the renderer once the canvas font has loaded, or to null without WebGL 2.
export async function createRenderer() {
  const canvas = document.getElementById('glyphs');
  const gl = canvas.getContext('webgl2', { antialias: false, depth: false });
  if (!gl) return null;
  await document.fonts.load(CSS_FONT);
  const m = document.createElement('canvas').getContext('2d'); m.font = CSS_FONT;
  const cw = m.measureText('M').width;

  // One triangle that covers the screen, made from the vertex index alone.
  const VS = `#version 300 es
  void main() { gl_Position = vec4(gl_VertexID == 1 ? 3. : -1., gl_VertexID == 2 ? 3. : -1., 0., 1.); }`;

  // Pass 1. kind 1 (hatching) keeps the glyph the tree wrote. Otherwise the cell's patch of ink decides: thin, elongated ink
  // takes a stroke glyph (- \ | /), other ink takes . : or # by coverage. A longer ramp (= + * % @) read as random noise on
  // the trunk and at node seams. A cell with almost no ink shows the background animation (kind 2) or nothing.
  const cellProg = program(gl, VS, `#version 300 es
  precision highp float; precision highp int;
  uniform sampler2D uSrc, uCellA, uCellB;   // ink (row 0 at the bottom, premultiplied), glyph and kind, colour
  uniform vec2 uGrid, uSS;                  // cols and rows, ink texels per cell
  uniform float uAspect, uDark;             // cell width over height, dark mode
  uniform vec3 uInk;
  layout(location = 0) out vec4 oA;
  layout(location = 1) out vec4 oB;
  float pick(ivec2 cell, out vec3 rgb, out float cov) {
    float s = 0., sx = 0., sy = 0., sxx = 0., syy = 0., sxy = 0.; rgb = vec3(0.);
    ivec2 n = ivec2(uSS); int top = int(uGrid.y * uSS.y) - 1;
    for (int j = 0; j < n.y; j++) for (int i = 0; i < n.x; i++) {
      ivec2 t = cell * n + ivec2(i, j);
      vec4 c = texelFetch(uSrc, ivec2(t.x, top - t.y), 0);
      float a = c.a; if (a < 0.02) continue;
      float fi = float(i), fj = float(j);
      s += a; rgb += c.rgb / max(a, 1e-4) * a; sx += a * fi; sy += a * fj; sxx += a * fi * fi; syy += a * fj * fj; sxy += a * fi * fj;
    }
    cov = s / float(n.x * n.y);
    if (s <= 0.) return 0.;
    rgb /= s;
    float mx = sx / s, my = sy / s, ax = 1. / uSS.x, ay = 1. / (uSS.y * uAspect);
    float vxx = (sxx / s - mx * mx) * ax * ax, vyy = (syy / s - my * my) * ay * ay, vxy = (sxy / s - mx * my) * ax * ay;
    float el = sqrt((vxx - vyy) * (vxx - vyy) + 4. * vxy * vxy) / (vxx + vyy + 1e-6);
    if (cov < 0.45 && el > 0.6) {
      float d = mod(degrees(0.5 * atan(2. * vxy, vxx - vyy)) + 180., 180.);
      return d < 22.5 || d >= 157.5 ? 3. : d < 67.5 ? 10. : d < 112.5 ? 11. : 12.;
    }
    return cov < 0.1 ? 0. : cov < 0.25 ? 1. : cov < 0.5 ? 2. : 7.;
  }
  void main() {
    ivec2 cell = ivec2(gl_FragCoord.xy);
    vec4 a = texelFetch(uCellA, cell, 0), given = texelFetch(uCellB, cell, 0);
    int kind = int(a.g * 255. + .5);
    vec3 rgb; float cov, g = kind == 1 ? a.r * 255. : pick(cell, rgb, cov);
    if (kind == 1) { oA = vec4(g / 255., 0., 0., 1.); oB = given; return; }
    if (cov < 0.06) { bool f = kind == 2; oA = vec4(f ? a.r : 0., 0., 0., 1.); oB = f ? given : vec4(0.); return; }
    // Ink darkens with density, like a deeper line. The dark mode lifts it to a bright tone of the same hue.
    rgb = mix(rgb, uInk, min(1., cov * 1.1) * 0.55);
    if (uDark > .5) rgb += 210. / 255. - max(rgb.r, max(rgb.g, rgb.b));
    oA = vec4(g / 255., 0., 0., 1.); oB = vec4(rgb, 1.);
  }`);

  // Pass 2.
  const stampProg = program(gl, VS, `#version 300 es
  precision highp float;
  uniform sampler2D tA, tB, uAtlas; uniform vec2 uCellPx, uAtlasSize, uView, uGrid; uniform float uSlot;
  out vec4 o;
  void main() {
    vec2 p = vec2(gl_FragCoord.x, uView.y - gl_FragCoord.y);
    ivec2 cell = ivec2(floor(p / uCellPx));
    if (cell.x >= int(uGrid.x) || cell.y >= int(uGrid.y)) discard;
    float g = floor(texelFetch(tA, cell, 0).r * 255. + .5);
    vec4 c = texelFetch(tB, cell, 0);
    float a = texture(uAtlas, (vec2(g * uSlot, 0.) + p - vec2(cell) * uCellPx) / uAtlasSize).a * c.a;
    o = vec4(c.rgb * a, a);
  }`);

  function texture(w, h, src = null, filter = gl.NEAREST) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (src) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, src);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    return t;
  }
  function framebuffer(attachments, stencil, w, h) {
    const f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    attachments.forEach((t, i) => gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, t, 0));
    gl.drawBuffers(attachments.map((_, i) => gl.COLOR_ATTACHMENT0 + i));
    if (stencil) {   // gpu-path.js fills shapes with the stencil buffer
      const rb = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, rb); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH24_STENCIL8, w, h);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, rb);
    }
    return f;
  }
  // Binds textures to units in order and sets the uniforms of the program in use.
  function uniforms(prog, textures, values) {
    Object.entries(textures).forEach(([name, t], i) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, t); gl.uniform1i(gl.getUniformLocation(prog, name), i); });
    for (const [name, v] of Object.entries(values)) {
      const at = gl.getUniformLocation(prog, name);
      if (typeof v === 'number') gl.uniform1f(at, v); else if (v.length === 2) gl.uniform2fv(at, v); else gl.uniform3fv(at, v);
    }
  }

  const paths = createPathContext(gl);
  const lut = new Uint8Array(256);   // char code -> glyph index
  [...GLYPHS].forEach((c, i) => { lut[c.charCodeAt(0)] = i; });
  let d, inkTex, inkFB, aTex, bTex, cellFB, cellATex, cellBTex, atlas, slot, ac;
  // Called on every resize. All GPU objects are made for one size, so a new size makes new ones.
  function resize(dims) {
    if (d && ['W', 'H', 'cols', 'rows', 'dpr'].every(k => d[k] === dims[k])) return;
    d = dims;
    for (const t of [inkTex, aTex, bTex, cellATex, cellBTex, atlas]) gl.deleteTexture(t ?? null);
    for (const f of [inkFB, cellFB]) gl.deleteFramebuffer(f ?? null);
    canvas.width = Math.floor(d.W * d.dpr); canvas.height = Math.floor(d.H * d.dpr); canvas.style.height = d.H + 'px';
    inkTex = texture(d.cols * SSX, d.rows * SSY); inkFB = framebuffer([inkTex], true, d.cols * SSX, d.rows * SSY);
    aTex = texture(d.cols, d.rows); bTex = texture(d.cols, d.rows); cellFB = framebuffer([aTex, bTex], false);
    cellATex = texture(d.cols, d.rows); cellBTex = texture(d.cols, d.rows);
    slot = Math.ceil(cw * d.dpr) + 2;
    ac = document.createElement('canvas'); ac.width = slot * GLYPHS.length; ac.height = Math.ceil(LH * d.dpr);
    const g = ac.getContext('2d'); g.font = `600 ${FONT * d.dpr}px "Source Code Pro"`; g.textBaseline = 'top'; g.fillStyle = '#fff';
    [...GLYPHS].forEach((ch, i) => g.fillText(ch, i * slot, 0));
    atlas = texture(0, 0, ac, gl.LINEAR);
  }

  function render({ cellA, cellB, dark, ink }) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, inkFB);
    paths.flush(d.cols * SSX, d.rows * SSY);
    for (let i = 0; i < cellA.length; i += 4) cellA[i] = lut[cellA[i]];
    gl.bindTexture(gl.TEXTURE_2D, cellATex); gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, d.cols, d.rows, gl.RGBA, gl.UNSIGNED_BYTE, cellA);
    gl.bindTexture(gl.TEXTURE_2D, cellBTex); gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, d.cols, d.rows, gl.RGBA, gl.UNSIGNED_BYTE, cellB);

    gl.bindFramebuffer(gl.FRAMEBUFFER, cellFB); gl.viewport(0, 0, d.cols, d.rows);
    gl.useProgram(cellProg);
    uniforms(cellProg, { uSrc: inkTex, uCellA: cellATex, uCellB: cellBTex },
      { uGrid: [d.cols, d.rows], uSS: [SSX, SSY], uAspect: cw / LH, uDark: dark ? 1 : 0, uInk: ink.map(v => v / 255) });
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(stampProg);
    uniforms(stampProg, { tA: aTex, tB: bTex, uAtlas: atlas },
      { uCellPx: [cw * d.dpr, LH * d.dpr], uAtlasSize: [ac.width, ac.height], uView: [d.W * d.dpr, d.H * d.dpr], uGrid: [d.cols, d.rows], uSlot: slot });
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  return { paths, cw, resize, render };
}
