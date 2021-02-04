attribute vec3 aVertex;
// attribute vec4 aVertexColor;
attribute vec2 aVertexTexCoord;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

// varying lowp vec4 vColor;
varying highp vec2 vTexCoord;

void main() {
  // gl_PointSize = 20.0;
  gl_Position = projection * view * model * vec4(aVertex, 1.0);
  // vColor = aVertexColor;
  vTexCoord = aVertexTexCoord;
}