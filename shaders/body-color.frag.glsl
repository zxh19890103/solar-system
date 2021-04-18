precision mediump float;

uniform sampler2D uSampler;

varying vec2 vTexCoord;
varying vec4 vCamTexCoord;

void main() {
  vec3 ndcCoord = vCamTexCoord.xyz / vCamTexCoord.w;
  bool inRange = 
      ndcCoord.x >= -1.0 &&
      ndcCoord.x <= 1.0 &&
      ndcCoord.y >= -1.0 &&
      ndcCoord.y <= 1.0;

  if (inRange) {
    gl_FragColor =  vec4(1.0, 1.0, 0.0, 1);
  } else {
    gl_FragColor = texture2D(uSampler, vTexCoord);
  }
}