precision mediump float;
uniform vec2 a_pos;

uniform vec2 u_resolution;

void main() {

    // Get pixel coordinates (e.g., 0 to 800)
    vec2 pixelPos = gl_FragCoord.xy;
    
    // Normalize to 0.0 - 1.0
    vec2 uv = gl_FragCoord.xy / u_resolution;    

  gl_FragColor = vec4(0.31, 0.31, 0.9, 1.0);
}
