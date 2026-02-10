// CurvedTrackEffect.js
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

    // ======= PARAM-SPACE QUAD (NO sin/cos here) =======
    // a_pos = (localThetaOffsetRadians, heightAlongAxis, unused)
    this.halfArc = 0.17;        // quad width around cylinder (radians)
    const h0 = -12.0, h1 = 12.0;

    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -this.halfArc, h0, 0.0,
         this.halfArc, h0, 0.0,
        -this.halfArc, h1, 0.0,
         this.halfArc, h1, 0.0,
      ]),
      gl.STATIC_DRAW
    );

    this.program.use();

    // attribs
    this.posLoc = gl.getAttribLocation(this.program.program, "a_pos");

    // uniforms (vert)
    this.timeLoc    = gl.getUniformLocation(this.program.program, "u_time");
    this.camZLoc    = gl.getUniformLocation(this.program.program, "u_camZ");
    this.fovLoc     = gl.getUniformLocation(this.program.program, "u_fov");
    this.radiusLoc  = gl.getUniformLocation(this.program.program, "u_radius");
    this.thetaLoc   = gl.getUniformLocation(this.program.program, "u_theta");
    this.slideLoc   = gl.getUniformLocation(this.program.program, "u_slide");
    this.halfArcLoc = gl.getUniformLocation(this.program.program, "u_halfArc");

    // uniforms (frag) if your frag uses these names
    this.resLoc = gl.getUniformLocation(this.program.program, "u_resolution");

    // params (tweak)
    this.radius = 26.9;
    this.speedRot = 0.6;     // rad/sec
    this.speedSlide = 2.0;   // units/sec along cylinder axis
  }

  render(gl, app, tMs) {
    const t = tMs * 0.001;

    this.program.use();

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    if (this.resLoc) {
      gl.uniform2f(this.resLoc, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }

    // uniforms
    gl.uniform1f(this.timeLoc, t);
    gl.uniform1f(this.camZLoc, -5.0);
    gl.uniform1f(this.fovLoc, 1.2);
    gl.uniform1f(this.radiusLoc, this.radius);
    gl.uniform1f(this.halfArcLoc, this.halfArc);

    gl.uniform1f(this.thetaLoc, t * this.speedRot);
    gl.uniform1f(this.slideLoc, t * this.speedSlide);

    // attrib
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.enableVertexAttribArray(this.posLoc);
    gl.vertexAttribPointer(this.posLoc, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
