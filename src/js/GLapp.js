export class GLApp {
  constructor(canvas, { dpr = devicePixelRatio } = {}) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!this.gl) throw new Error("WebGL not supported");

    this.dpr = dpr;
    this.effects = [];
    this.running = false;

    this._resize = this._resize.bind(this);
    this._frame = this._frame.bind(this);

    window.addEventListener("resize", this._resize);
    this._resize();
  }

  addEffect(effect) {
    effect.init(this.gl, this);
    this.effects.push(effect);
    return effect;
  }

  start() {
    if (this.running) return;
    this.running = true;
    requestAnimationFrame(this._frame);
  }

  stop() {
    this.running = false;
  }

  _resize() {
    const { gl, canvas, dpr } = this;
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(r.width * dpr));
    canvas.height = Math.max(1, Math.floor(r.height * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    for (const e of this.effects) e.resize?.(gl, this);
  }

  _frame(t) {
    if (!this.running) return;
    const gl = this.gl;

    // Clear once (effects can also draw over it)
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    for (const e of this.effects) e.render(gl, this, t);

    requestAnimationFrame(this._frame);
  }
}
