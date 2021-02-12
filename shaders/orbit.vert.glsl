attribute vec3 aVertex;

uniform mat4 view;
uniform mat4 projection;

void main() {
  gl_PointSize = .6;
  gl_Position = projection * view * vec4(aVertex, 1.0);
}