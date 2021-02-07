attribute vec3 aVertex;
// attribute vec4 aVertexColor;
attribute vec2 aVertexTexCoord;
attribute vec3 aVertexNormal;

uniform mat4 local;
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
// uniform mat4 faceNormal;

uniform vec3 uAmbientLight;
uniform vec3 uDirectionalLightColor;
uniform vec3 uLightDirection;

// varying lowp vec4 vColor;
varying highp vec2 vTexCoord;
varying highp vec3 vLighting;

void main() {
  // gl_PointSize = 20.0;
  gl_Position = projection * view * model * local * vec4(aVertex, 1.0);
  // vColor = aVertexColor;

  vLighting = uAmbientLight + max(
    dot(
      vec3(local * vec4(aVertexNormal, 1.0)),
      uLightDirection
    ),
    0.0
  ) * uDirectionalLightColor;
  vTexCoord = aVertexTexCoord;
}