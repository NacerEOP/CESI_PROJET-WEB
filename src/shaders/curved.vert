precision highp float;

attribute vec3 a_pos;

uniform float u_fov;
uniform float u_radius;
uniform float u_theta;
uniform float u_slide;
uniform float u_camZ;
uniform float u_halfArc;

void main() {
  float theta = u_theta + a_pos.x;

  // world pos on cylinder (axis = Y)
  vec3 world;
  world.x = u_radius * sin(theta);
  world.z = u_radius * cos(theta);
  world.y = a_pos.y ;

  // camera-space depth for THIS vertex
  float z = world.z - u_camZ;

  // ----- WHOLE QUAD CLIP -----
  // compute the "worst" (smallest) depth among the 4 corners by checking the two arc endpoints
  float zL = u_radius * cos(u_theta - u_halfArc) - u_camZ;
  float zR = u_radius * cos(u_theta + u_halfArc) - u_camZ;
  float zMin = min(zL, zR);

  float nearZ = 0.05;
  if (zMin <= nearZ) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    return;
  }

  // perspective
  float invZ = 1.0 / max(z, nearZ);
  vec2 ndc = world.xy * invZ * u_fov;
  gl_Position = vec4(ndc, 0.0, 1.0);
}
