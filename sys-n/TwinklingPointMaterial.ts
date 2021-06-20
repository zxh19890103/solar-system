export class TwinklingPointMaterial extends THREE.Material {
}

const material = new THREE.ShaderMaterial(
  {
    uniforms: {},
    vertexShader: `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    fragmentShader: `
    void main() {
      gl_Color=vec4(34, 98, 12, 1);
    }
    `
  }
)

THREE.MeshPhongMaterial