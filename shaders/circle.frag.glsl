// uniform highp vec4 uVertexColor;
uniform sampler2D uSampler;

varying lowp vec2 vTexCoord;

void main() {
  gl_FragColor = texture2D(uSampler, vTexCoord);
}