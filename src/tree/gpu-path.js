import { styleRGBA } from './glyphs.js';

// A small subset of CanvasRenderingContext2D that draws on the GPU, into a render target.
// It covers the calls the tree drawing makes: paths of lines and quadratic curves,
// fill (nonzero), stroke (bevel joins, butt caps) and setTransform.
// strokeOutsideFill() draws only the part of a stroke outside the path's fill:
// the outer outline of overlapping node shapes.
//
// Every call is drawn with stencil-then-cover. Pass 1 writes the shape into the stencil
// buffer with colour off. Pass 2 paints the call's bounding box where the stencil is set,
// and clears the stencil as it goes. So each pixel is painted once per call, whatever the
// path's shape, and overlapping triangles never stack their alpha.
//
// Commands are recorded during the frame and drawn in flush(), with one buffer upload.

const VS = `#version 300 es
in vec2 aPos;
uniform vec2 uSize;
void main() { gl_Position = vec4(aPos.x / uSize.x * 2. - 1., 1. - aPos.y / uSize.y * 2., 0., 1.); }`;
const FS = `#version 300 es
precision mediump float;
uniform vec4 uColour;
out vec4 o;
void main() { o = uColour; }`;

const FILL = 0, STROKE = 1, OUTSIDE = 2;
// Premultiplied, 0 to 1. styleRGBA() in glyphs.js parses and caches the CSS colour.
const parseColour = s => { const [r, g, b, a] = styleRGBA(s); return [r / 255 * a, g / 255 * a, b / 255 * a, a]; };

// Compiles and links a shader program. Attribute 0 is aPos.
export function program(gl, vs, fs) {
  const prog = gl.createProgram();
  for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
    const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
    gl.attachShader(prog, sh);
  }
  gl.bindAttribLocation(prog, 0, 'aPos'); gl.linkProgram(prog);
  return prog;
}

export function createPathContext(gl) {
  const prog = program(gl, VS, FS);
  const uSize = gl.getUniformLocation(prog, 'uSize'), uColour = gl.getUniformLocation(prog, 'uColour');
  const vao = gl.createVertexArray(), vbo = gl.createBuffer();
  gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  let verts = new Float32Array(1 << 16), nv = 0;
  const cmds = [];
  function push(x, y) {
    if (nv + 2 > verts.length) { const v = new Float32Array(verts.length * 2); v.set(verts); verts = v; }
    verts[nv++] = x; verts[nv++] = y;
  }
  function tri(ax, ay, bx, by, cx, cy) { push(ax, ay); push(bx, by); push(cx, cy); }

  // Path state, in device coordinates (the transform is applied as points are added).
  let subs = [], cur = null, m = [1, 0, 0, 1, 0, 0];
  const scale = () => Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2]));

  const ctx = {
    fillStyle: '#000', strokeStyle: '#000', lineWidth: 1,
    setTransform(a, b, c, d, e, f) { m = [a, b, c, d, e, f]; },
    beginPath() { subs = []; cur = null; },
    // Points are transformed inline, so a frame's thousands of points allocate no arrays.
    moveTo(x, y) { cur = { pts: [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]], closed: false }; subs.push(cur); },
    lineTo(x, y) { if (!cur) return ctx.moveTo(x, y); cur.pts.push(m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]); },
    quadraticCurveTo(cx, cy, x, y) {
      const p = cur.pts, x0 = p[p.length - 2], y0 = p[p.length - 1];
      const qx = m[0] * cx + m[2] * cy + m[4], qy = m[1] * cx + m[3] * cy + m[5], x1 = m[0] * x + m[2] * y + m[4], y1 = m[1] * x + m[3] * y + m[5];
      // About one segment per 3 device pixels of control polygon, 1 to 24 segments.
      const n = Math.max(1, Math.min(24, Math.ceil((Math.hypot(qx - x0, qy - y0) + Math.hypot(x1 - qx, y1 - qy)) / 3)));
      for (let i = 1; i <= n; i++) {
        const t = i / n, u = 1 - t;
        p.push(u * u * x0 + 2 * u * t * qx + t * t * x1, u * u * y0 + 2 * u * t * qy + t * t * y1);
      }
    },
    closePath() { if (cur) { cur.closed = true; cur = null; } },
    fill() { record(FILL, ctx.fillStyle); },
    stroke() { record(STROKE, ctx.strokeStyle); },
    strokeOutsideFill() { record(OUTSIDE, ctx.strokeStyle); },
  };

  let bx0, by0, bx1, by1;
  const grow = (x, y) => { if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y; };
  // Fan from the first point of each subpath. With the nonzero stencil rule, the overlapping
  // and inside-out triangles of a concave shape cancel out, so the fill is still exact.
  function fillGeom() {
    for (const s of subs) {
      const p = s.pts;
      for (let i = 2; i + 3 < p.length; i += 2) tri(p[0], p[1], p[i], p[i + 1], p[i + 2], p[i + 3]);
      for (let i = 0; i < p.length; i += 2) grow(p[i], p[i + 1]);
    }
  }
  function strokeGeom(w) {
    const h = w / 2;
    for (const s of subs) {
      const p = s.pts, n = p.length, close = s.closed && n >= 4, end = close ? n + 2 : n;   // a closed path ends back at its first point
      let pnx = 0, pny = 0, has = false;
      for (let i = 0; i + 3 < end; i += 2) {
        const ax = p[i], ay = p[i + 1], bx = p[(i + 2) % n], by = p[(i + 3) % n];
        const L = Math.hypot(bx - ax, by - ay); if (L < 1e-6) continue;
        const nx = -(by - ay) / L * h, ny = (bx - ax) / L * h;
        tri(ax + nx, ay + ny, bx + nx, by + ny, bx - nx, by - ny);
        tri(ax + nx, ay + ny, bx - nx, by - ny, ax - nx, ay - ny);
        if (has) { tri(ax, ay, ax + pnx, ay + pny, ax + nx, ay + ny); tri(ax, ay, ax - pnx, ay - pny, ax - nx, ay - ny); }   // bevel join
        pnx = nx; pny = ny; has = true;
        grow(ax - h, ay - h); grow(ax + h, ay + h); grow(bx - h, by - h); grow(bx + h, by + h);
      }
    }
  }
  function record(kind, style) {
    if (!subs.length) return;
    const col = parseColour(style);
    if (col[3] <= 0) return;
    bx0 = by0 = Infinity; bx1 = by1 = -Infinity;
    const c = { kind, col, fillStart: nv / 2, fillCount: 0, strokeStart: 0, strokeCount: 0 };
    if (kind !== STROKE) { fillGeom(); c.fillCount = nv / 2 - c.fillStart; }
    if (kind !== FILL) { c.strokeStart = nv / 2; strokeGeom(ctx.lineWidth * scale()); c.strokeCount = nv / 2 - c.strokeStart; }
    if (!(bx1 > bx0)) { nv = c.fillStart * 2; return; }
    c.coverStart = nv / 2;
    tri(bx0, by0, bx1, by0, bx1, by1); tri(bx0, by0, bx1, by1, bx0, by1);
    cmds.push(c);
  }

  ctx.flush = (width, height) => {
    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0); gl.clearStencil(0); gl.stencilMask(0xff);
    gl.colorMask(true, true, true, true);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    if (cmds.length) {
      gl.useProgram(prog); gl.uniform2f(uSize, width, height);
      gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, verts.subarray(0, nv), gl.STREAM_DRAW);
      gl.enable(gl.STENCIL_TEST); gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      for (const c of cmds) {
        gl.colorMask(false, false, false, false);
        if (c.fillCount) {   // winding count in the low 7 bits
          gl.stencilMask(0x7f); gl.stencilFunc(gl.ALWAYS, 0, 0xff);
          gl.stencilOpSeparate(gl.FRONT, gl.KEEP, gl.KEEP, gl.INCR_WRAP);
          gl.stencilOpSeparate(gl.BACK, gl.KEEP, gl.KEEP, gl.DECR_WRAP);
          gl.drawArrays(gl.TRIANGLES, c.fillStart, c.fillCount);
        }
        if (c.strokeCount) {   // stroke pixels get the top bit, outside the fill only for OUTSIDE
          // ref 0x80 masked by 0x7f compares as 0, so EQUAL passes where the winding count is 0.
          // REPLACE through write mask 0x80 sets the top bit.
          gl.stencilMask(0x80);
          gl.stencilFunc(c.kind === OUTSIDE ? gl.EQUAL : gl.ALWAYS, 0x80, 0x7f);
          gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
          gl.drawArrays(gl.TRIANGLES, c.strokeStart, c.strokeCount);
        }
        // Cover: paint where this call marked the stencil, and clear it everywhere in the box.
        gl.colorMask(true, true, true, true); gl.stencilMask(0xff);
        if (c.kind === FILL) gl.stencilFunc(gl.NOTEQUAL, 0, 0x7f); else gl.stencilFunc(gl.EQUAL, 0x80, 0x80);
        gl.stencilOp(gl.ZERO, gl.ZERO, gl.ZERO);
        gl.uniform4fv(uColour, c.col);
        gl.drawArrays(gl.TRIANGLES, c.coverStart, 6);
      }
      gl.disable(gl.STENCIL_TEST); gl.disable(gl.BLEND); gl.bindVertexArray(null);
    }
    cmds.length = 0; nv = 0; subs = []; cur = null;
  };
  return ctx;
}
