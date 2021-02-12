attribute vec3 aVertex;
attribute vec4 aVertexColor;

uniform mat4 local;
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

varying lowp vec4 vColor;

void main() {
  gl_Position = projection * view * model * local * vec4(aVertex, 1.0);
  vColor = aVertexColor;
}