precision highp float;

attribute vec3 a_pos;
attribute vec2 a_uv;

// If instancing is supported, these exist:
attribute float a_baseTheta;
attribute float a_panelId;

// Fallback uniforms (used when no instancing):
uniform float u_baseTheta;
uniform float u_panelId;

uniform float u_fov;
uniform float u_radius;
uniform float u_camZ;
uniform float u_thetaGlobal;
uniform float u_slide;

varying vec2 v_uv;
varying float v_panelId;

void main() {
  // Choose baseTheta/panelId from instanced attrib if present.
  // In WebGL, missing attribs read as 0, so this still works:
  float baseTheta = (a_baseTheta != 0.0) ? a_baseTheta : u_baseTheta;
  float pid       = (a_panelId   != 0.0) ? a_panelId   : u_panelId;

  float theta = u_thetaGlobal + baseTheta + a_pos.x;

  vec3 world;
  world.x = u_radius * sin(theta);
  world.z = u_radius * cos(theta);
  world.y = a_pos.y + u_slide;

  float z = world.z - u_camZ;
  float nearZ = 0.05;

  if (z <= nearZ) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
  } else {
    float invZ = 1.0 / z;
    vec2 ndc = world.xy * invZ * u_fov;
    gl_Position = vec4(ndc, 0.0, 1.0);
  }

  v_uv = a_uv;
  v_panelId = pid;
}
