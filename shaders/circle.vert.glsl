attribute vec3 aVertex;
attribute vec2 aVertexTexCoord;

uniform mat4 local;
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

uniform float uVertexSize;

varying lowp vec2 vTexCoord;

void main() {
  gl_PointSize = 9.0;
  gl_Position = projection * view * model * local* vec4(aVertex, 1.0);
  vTexCoord = aVertexTexCoord;
}