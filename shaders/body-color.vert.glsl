precision mediump float;

attribute vec3 aVertex;
attribute vec2 aVertexTexCoord;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform mat4 u_cam;
uniform mat4 u_cam2;

varying vec2 vTexCoord;
varying vec4 vCamTexCoord;

void main() {
  gl_PointSize = 1.0;
  vec4 world_Position = model * vec4(aVertex, 1.0);
  gl_Position = projection * view * world_Position;

  vCamTexCoord = u_cam2 * u_cam * world_Position;
  vTexCoord = aVertexTexCoord;
}