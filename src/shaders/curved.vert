attribute vec2 a_pos;
uniform float u_time;

void main() {
  float t = fract(u_time * 0.1);

  float x = mix(1.2, -1.2, t);
  float y = a_pos.y + 0.2 * sin(t * 3.1415);
  float z = 0.3 * sin(t * 3.1415);

  float scale = 1.0 / (1.0 + z);

  gl_Position = vec4(
    (a_pos.x + x) * scale,
    y * scale,
    0.0,
    1.0
  );
}
