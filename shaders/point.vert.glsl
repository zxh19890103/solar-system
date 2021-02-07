attribute vec3 aVertex;

uniform mat4 local;
uniform mat4 view;
uniform mat4 projection;

uniform float uVertexSize;

void main() {
  gl_PointSize = uVertexSize;
  gl_Position = projection * view * local* vec4(aVertex, 1.0);
}