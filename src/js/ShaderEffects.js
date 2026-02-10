// CurvedTrackEffect.js
import { ShaderProgram } from "./ShaderProgram.js";

export class CurvedTrackEffect {
  async init(gl, app) {
    this.gl = gl;
    this.app = app;

    // Detect WebGL2
    this.isWebGL2 = (typeof WebGL2RenderingContext !== "undefined") && (gl instanceof WebGL2RenderingContext);

    // Try instancing
    this.instExt = null;
    if (!this.isWebGL2) {
      this.instExt = gl.getExtension("ANGLE_instanced_arrays");
    }

    // If neither WebGL2 nor ANGLE_instanced_arrays, we will fallback to loop-draw
    this.hasInstancing = this.isWebGL2 || !!this.instExt;

    this.program = new ShaderProgram(
      gl,
      "../shaders/curved.vert",
      "../shaders/curved.frag"
    );
    await this.program.load();
    this.program.use();

    // ===== Settings =====
    this.panelCount = 24;
    this.fillRatio = 0.75;   // 0..1 (panel vs gap)
    this.radius = 26.9;
    this.h0 = -12.0;
    this.h1 =  12.0;

    this.speedRot = 0.2;
    this.speedSlide = 0.0;

    this.step = (Math.PI * 2) / this.panelCount;
    this.halfArc = (this.step * this.fillRatio) * 0.5;

    // ===== Quad VBO (pos + uv interleaved) =====
    // a_pos = (localThetaOffsetRadians, height, unused)
    // a_uv  = (0..1, 0..1)
    const quad = new Float32Array([
      -this.halfArc, this.h0, 0.0,   0.0, 0.0,
       this.halfArc, this.h0, 0.0,   1.0, 0.0,
      -this.halfArc, this.h1, 0.0,   0.0, 1.0,
       this.halfArc, this.h1, 0.0,   1.0, 1.0,
    ]);

    this.quadVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVbo);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    // attribs
    this.posLoc = gl.getAttribLocation(this.program.program, "a_pos");
    this.uvLoc  = gl.getAttribLocation(this.program.program, "a_uv");

    // uniforms
    this.resLoc       = gl.getUniformLocation(this.program.program, "u_resolution");
    this.timeLoc      = gl.getUniformLocation(this.program.program, "u_time");
    this.fovLoc       = gl.getUniformLocation(this.program.program, "u_fov");
    this.camZLoc      = gl.getUniformLocation(this.program.program, "u_camZ");
    this.radiusLoc    = gl.getUniformLocation(this.program.program, "u_radius");
    this.thetaGlobalLoc = gl.getUniformLocation(this.program.program, "u_thetaGlobal");
    this.slideLoc     = gl.getUniformLocation(this.program.program, "u_slide");

    // These two are used by BOTH instanced + fallback loop
    this.baseThetaULoc = gl.getUniformLocation(this.program.program, "u_baseTheta");
    this.panelIdULoc   = gl.getUniformLocation(this.program.program, "u_panelId");

    // If we have instancing, set up instance attributes too
    if (this.hasInstancing) {
      // Instance buffer: [baseTheta, panelId] per instance
      const instanceData = new Float32Array(this.panelCount * 2);
      for (let i = 0; i < this.panelCount; i++) {
        instanceData[i * 2 + 0] = i * this.step;
        instanceData[i * 2 + 1] = i;
      }

      this.instanceVbo = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceVbo);
      gl.bufferData(gl.ARRAY_BUFFER, instanceData, gl.STATIC_DRAW);

      this.baseThetaLoc = gl.getAttribLocation(this.program.program, "a_baseTheta");
      this.panelIdLoc   = gl.getAttribLocation(this.program.program, "a_panelId");
    }
  }

  render(gl, app, tMs) {
    const t = tMs * 0.001;

    this.program.use();

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    // uniforms common
    if (this.resLoc) gl.uniform2f(this.resLoc, gl.drawingBufferWidth, gl.drawingBufferHeight);
    if (this.timeLoc) gl.uniform1f(this.timeLoc, t);

    gl.uniform1f(this.fovLoc, 1.2);
    gl.uniform1f(this.camZLoc, -5.0);
    gl.uniform1f(this.radiusLoc, this.radius);

    gl.uniform1f(this.thetaGlobalLoc, t * this.speedRot);
    gl.uniform1f(this.slideLoc, t * this.speedSlide);

    // Bind quad VBO + attrib pointers
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVbo);
    const stride = 5 * 4;

    gl.enableVertexAttribArray(this.posLoc);
    gl.vertexAttribPointer(this.posLoc, 3, gl.FLOAT, false, stride, 0);

    gl.enableVertexAttribArray(this.uvLoc);
    gl.vertexAttribPointer(this.uvLoc, 2, gl.FLOAT, false, stride, 3 * 4);

    // ===== Path 1: Instanced =====
    if (this.hasInstancing) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceVbo);

      gl.enableVertexAttribArray(this.baseThetaLoc);
      gl.vertexAttribPointer(this.baseThetaLoc, 1, gl.FLOAT, false, 2 * 4, 0);

      gl.enableVertexAttribArray(this.panelIdLoc);
      gl.vertexAttribPointer(this.panelIdLoc, 1, gl.FLOAT, false, 2 * 4, 1 * 4);

      if (this.isWebGL2) {
        gl.vertexAttribDivisor(this.baseThetaLoc, 1);
        gl.vertexAttribDivisor(this.panelIdLoc, 1);

        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.panelCount);
      } else {
        this.instExt.vertexAttribDivisorANGLE(this.baseThetaLoc, 1);
        this.instExt.vertexAttribDivisorANGLE(this.panelIdLoc, 1);

        this.instExt.drawArraysInstancedANGLE(gl.TRIANGLE_STRIP, 0, 4, this.panelCount);
      }
      return;
    }

    // ===== Path 2: Fallback (no instancing) =====
    // Draw N times with uniforms (still works everywhere)
    for (let i = 0; i < this.panelCount; i++) {
      gl.uniform1f(this.baseThetaULoc, i * this.step);
      gl.uniform1f(this.panelIdULoc, i);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }
}
