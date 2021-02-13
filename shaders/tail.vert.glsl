attribute vec3 aVertex;
attribute vec4 aVertexColor;

uniform mat4 rotation;
uniform mat4 view;
uniform mat4 projection;

varying lowp vec4 vColor;

void main() {
  gl_PointSize = 1.0;
  gl_Position = projection * view * rotation * vec4(aVertex, 1.0);
  vColor = aVertexColor;
}