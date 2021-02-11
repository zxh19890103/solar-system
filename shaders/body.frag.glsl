uniform sampler2D uSampler;

varying mediump vec2 vTexCoord;
varying highp vec3 vLighting;
varying lowp vec4 vColor;

void main() {
  if (vTexCoord[0] == 2.0) {
    gl_FragColor = vColor;
  } else {
    mediump vec4 texColor = texture2D(uSampler, vTexCoord);
    gl_FragColor = vec4(texColor.rgb * vLighting, texColor.a);
  }
}