attribute vec3 aVertex;

uniform mat4 local;
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

uniform float uVertexSize;

void main() {
  gl_PointSize = 2.0;
  gl_Position = projection * view * model * local* vec4(aVertex, 1.0);
}