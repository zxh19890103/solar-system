attribute vec3 aVertex;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main() {
  gl_PointSize = 2.0;
  gl_Position = projection * view * model * vec4(aVertex, 1.0);
}