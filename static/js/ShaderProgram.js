export class ShaderProgram {
  constructor(gl, vertPath, fragPath) {
    this.gl = gl;
    this.vertPath = vertPath;
    this.fragPath = fragPath;
    this.program = null;
  }

  async load() {
    const [vsSource, fsSource] = await Promise.all([
      fetch(this.vertPath).then(r => r.text()),
      fetch(this.fragPath).then(r => r.text())
    ]);

    const gl = this.gl;
    const vs = this._compile(gl.VERTEX_SHADER, vsSource);
    const fs = this._compile(gl.FRAGMENT_SHADER, fsSource);

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program));
    }

    this.program = program;
  }

  _compile(type, source) {
    const gl = this.gl;
    const sh = gl.createShader(type);
    gl.shaderSource(sh, source);
    gl.compileShader(sh);

    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(sh));
    }
    return sh;
  }

  use() {
    this.gl.useProgram(this.program);
  }
}
