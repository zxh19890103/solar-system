varying lowp vec4 vVertexColor;

varying highp vec3 vLighting;

void main() {
  gl_FragColor = vVertexColor;
  // gl_FragColor = vec4(vVertexColor.rgb * vLighting, vVertexColor.a);
}