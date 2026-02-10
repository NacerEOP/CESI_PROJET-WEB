import { ShaderProgram } from "./ShaderProgram.js";

export class CurvedTrackEffect {
  async init(gl, app) {
    this.gl = gl;
    this.app = app;

    this.program = new ShaderProgram(
      gl,
      "../shaders/curved.vert",
      "../shaders/curved.frag"
    );
    await this.program.load();

    // geometry (one quad)
    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -0.5, -0.9,
         0.5, -0.5,
        -0.5,  0.9,
         0.5,  0.5,
      ]),
      gl.STATIC_DRAW
    );

    // IMPORTANT: use program BEFORE querying locations / setting uniforms
    this.program.use();

    // attribs
    this.posLoc = gl.getAttribLocation(this.program.program, "a_pos");

    // uniforms (must exist in your .frag)
    this.timeLoc = gl.getUniformLocation(this.program.program, "u_time");
    this.resLoc  = gl.getUniformLocation(this.program.program, "u_resolution");

    // set initial resolution once (also do this again if canvas size changes)
    const canvas = gl.canvas;
    gl.uniform2f(this.resLoc, canvas.width, canvas.height);
  }

  render(gl, app, t) {
    this.program.use();

    // update resolution every frame (safe + handles resizes)
    const canvas = gl.canvas;
    gl.uniform2f(this.resLoc, canvas.width, canvas.height);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.enableVertexAttribArray(this.posLoc);
    gl.vertexAttribPointer(this.posLoc, 2, gl.FLOAT, false, 0, 0);

    // time in seconds
    gl.uniform1f(this.timeLoc, t * 0.001);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
