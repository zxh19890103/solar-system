import { Earth, Mars, Mercury, Venus } from '../sys/body-info'
import { AU } from '../sys/constants'

const toJ2000CSMat = new THREE.Matrix4().makeRotationX(-.5 * Math.PI)
toJ2000CSMat.multiply(new THREE.Matrix4().makeScale(1 / AU, 1 / AU, 1 / AU))

const toThreeJSCSMat = new THREE.Matrix4().makeRotationX(.5 * Math.PI)
toThreeJSCSMat.multiply(new THREE.Matrix4().makeScale(AU, AU, AU))

const BOOTSTRAP_STATE = {
  Mercury: parse(`
  X = 3.012935918964594E-01 Y =-2.788156976619674E-01 Z =-5.042148516534437E-02
  VX= 1.353961390211273E-02 VY= 2.197439592451381E-02 VZ= 5.536948697822908E-04
  LT= 2.388708216017943E-03 RG= 4.135920066283667E-01 RR=-5.017809119465085E-03`),
  Venus: parse(`
  X =-6.738542287147846E-01 Y = 2.471376575208060E-01 Z = 4.227655089795478E-02
  VX=-7.058824059055602E-03 VY=-1.908379086296848E-02 VZ= 1.454258067219449E-04
  LT= 4.152528799556816E-03 RG= 7.189880736684691E-01 RR= 6.459519243494290E-05`),
  Earth: parse(`
   X = 1.441226168058890E-01 Y =-1.006369021715738E+00 Z = 5.014695214271168E-05
   VX= 1.674837463620341E-02 VY= 2.368408002995637E-03 VZ=-1.911831254428104E-07
   LT= 5.871603213472773E-03 RG= 1.016636581605632E+00 RR= 2.983084199215344E-05`),
  Mars: parse(`
   X =-1.448600332238662E+00 Y = 8.193773588838459E-01 Z = 5.270552213974831E-02
   VX=-6.365587925097285E-03 VY=-1.098631180557002E-02 VZ=-7.408681607129227E-05
   LT= 9.616888484293108E-03 RG= 1.665112624082062E+00 RR= 1.293323013883035E-04`)
}

function parse(txt: string) {
  const regx = /-?\d\.\d+?E[+-]\d\d/ig
  let match = null
  const values: number[] = []
  while (match = regx.exec(txt)) {
    values.push(Number(match[0]))
  }
  const posi = values.slice(0, 3) as THREE.Vector3Tuple
  const velo = values.slice(3, 6) as THREE.Vector3Tuple
  return { velo, posi }
}

export {
  toThreeJSCSMat,
  toJ2000CSMat,
  BOOTSTRAP_STATE
}