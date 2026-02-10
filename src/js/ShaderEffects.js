import { ShaderProgram } from "./ShaderProgram.js";

export class CurvedTrackEffect {
  async init(gl, app) {
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
        -0.5, -0.5,
         0.5, -0.5,
        -0.5,  0.9,
         0.5,  0.5,
      ]),
      gl.STATIC_DRAW
    );

    this.posLoc = gl.getAttribLocation(this.program.program, "a_pos");
    this.timeLoc = gl.getUniformLocation(this.program.program, "u_time");
  }

  render(gl, app, t) {
    this.program.use();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.enableVertexAttribArray(this.posLoc);
    gl.vertexAttribPointer(this.posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.uniform1f(this.timeLoc, t * 0.001);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
