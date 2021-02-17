attribute vec3 aVertex;
attribute vec4 aVertexColor;
attribute vec3 aVertexNormal;

uniform mat4 uRotationMat;
uniform mat4 uModelMat;
uniform mat4 uViewMat;
uniform mat4 uProjectionMat;

// uniform vec3 uAmbientLight;
// uniform vec3 uDirectionalLightColor;
// uniform vec3 uLightDirection;

varying lowp vec4 vVertexColor;
varying highp vec3 vLighting;

void main() {
  gl_PointSize = 5.0;
  gl_Position = uProjectionMat * uViewMat * uModelMat * uRotationMat * vec4(aVertex, 1.0);
  
  // vLighting = uAmbientLight + max(
  //   dot(
  //     vec3(uRotationMat * vec4(aVertexNormal, 1.0)),
  //     uLightDirection
  //   ),
  //   0.0
  // ) * uDirectionalLightColor;

  vVertexColor = aVertexColor;
}