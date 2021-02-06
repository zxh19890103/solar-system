// varying lowp vec4 vColor;

uniform sampler2D uSampler;

varying lowp vec2 vTexCoord;
varying highp vec3 vLighting;

void main() {
  mediump vec4 texColor = texture2D(uSampler, vTexCoord);
  gl_FragColor = vec4(texColor.rgb * vLighting, texColor.a);
}