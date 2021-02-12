attribute vec4 aVertex;
attribute vec4 aVertexColor;

uniform mat4 local;
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

varying highp vec2 vTexCoord;
varying lowp vec4 vColor;

void main() {
  gl_PointSize = aVertex.w;
  gl_Position = projection * view * model * local * vec4(aVertex.xyz, 1.0);
  vColor = aVertexColor;
}