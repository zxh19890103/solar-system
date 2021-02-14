
uniform mediump float far;

varying lowp vec4 vColor;

void main() {
  gl_FragColor = vColor * far;
}