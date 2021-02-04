// varying lowp vec4 vColor;
varying lowp vec2 vTexCoord;

uniform sampler2D uSampler;

void main() {
  gl_FragColor = texture2D(uSampler, vTexCoord);
}