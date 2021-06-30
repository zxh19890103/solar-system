import { AU } from '../../sys/constants'

const toJ2000CSMat = new THREE.Matrix4().makeRotationX(-.5 * Math.PI)
toJ2000CSMat.multiply(new THREE.Matrix4().makeScale(1 / AU, 1 / AU, 1 / AU))

const toThreeJSCSMat = new THREE.Matrix4().makeRotationX(.5 * Math.PI)
toThreeJSCSMat.multiply(new THREE.Matrix4().makeScale(AU, AU, AU))

export {
  toThreeJSCSMat,
  toJ2000CSMat
}