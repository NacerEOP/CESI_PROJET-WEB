// curved.frag (WebGL1)
precision highp float;

uniform sampler2D u_tex;

// if you use an atlas:
uniform vec2 u_atlasSize;
uniform vec2 u_tileSize; // size of each panel tile in pixels (e.g. 512,512)
uniform float u_cols;    // number of columns in the atlas

varying vec2 v_uv;
varying float v_panelId;

void main() {
  // Panel -> tile position in atlas
  float id = floor(v_panelId + 0.5);
  float col = mod(id, u_cols);
  float row = floor(id / u_cols);

  vec2 tileUV = v_uv; // 0..1 within panel

  // convert tileUV to atlas UV
  vec2 atlasUV;
  atlasUV.x = (col * u_tileSize.x + tileUV.x * u_tileSize.x) / u_atlasSize.x;
  atlasUV.y = (row * u_tileSize.y + tileUV.y * u_tileSize.y) / u_atlasSize.y;

  vec4 color = texture2D(u_tex, atlasUV);
  gl_FragColor = color;
}
