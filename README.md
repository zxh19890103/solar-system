# projects Point3d to Point2d

## For Pc & Pp & Pe are on the one line:

```

d(Pc - Pp) + d(Pp - Pe) = d(Pc - Pe)

(Xc - Xp) ^ 2 + (Yc - Yp) ^ 2 + (Zc - Zp) ^ 2
+
(Xp - Xe) ^ 2 + (Yp - Ye) ^ 2 + (Zp - Ze) ^ 2
=
(Xc - Xe) ^ 2 + (Yc - Ye) ^ 2 + (Zc - Ze) ^ 2

=> 

(Xp^2 + Yp^2 + Zp ^ 2) - (XcXp + YcYp + ZcZp + XpXe + YpYe + ZpZe) = - (XcXe + YcYe + ZcZe)

// abort
(Xc - Xe) / (Xp - Xe)
=
(Yc - Ye) / (Yp - Ye)
=
(Zc - Ze) / (Zp - Ze)

1. (Xc - Xe) * (Yp - Ye) = (Xp - Xe) * (Yc - Ye)

  XcYp - XeYp + XpYe - XpYc = - XeYc + XcYe
  =>
  Xp(Ye - Yc) - Yp(Xe - Xc) = XcYe - XeYc

2. (Xc - Xe) * (Zp - Ze) = (Xp - Xe) * (Zc - Ze)

  XcZp - XeZp + XpZe - XpZc =  - XeZc + XcZe
  =>
  Xp(Ze - Zc) - Zp(Xe - Xc) =  XcZe - XeZc

3. (Zc - Ze) * (Yp - Ye) = (Zp - Ze) * (Yc - Ye)

  ZcYp - ZeYp + ZpYe - ZpYc = -ZeYc + ZcYe
  =>
  Yp(Zc - Ze) - Zp(Yc - Ye) = ZcYe - ZeYc

  summary:
  Xp(Ye - Yc) - Yp(Xe - Xc) = XcYe - XeYc
  Xp(Ze - Zc) - Zp(Xe - Xc) =  XcZe - XeZc
  Yp(Zc - Ze) - Zp(Yc - Ye) = ZcYe - ZeYc

```

## For Pp is one the plane.

```
s(d(Pc - Pf)) + s(d(Pf - Pp))
=
s(d(Pc - Pp))

(Xc - Xf) ^ 2 + (Yc - Yf) ^ 2 + (Zc - Zf) ^ 2
+
(Xf - Xp) ^ 2 + (Yf - Yp) ^ 2 + (Zf - Zp) ^ 2
=
(Xc - Xp) ^ 2 + (Yc - Yp) ^ 2 + (Zc - Zp) ^ 2

Xf ^ 2 + Yf ^ 2 + Zf ^ 2 - (Xc * Xf + Yc * Yf + Zc * Zf + Xf * Xp + Yf * Yp + Zf * Zp)
=
- (Xc * Xp + Yc * Yp + Zc * Zp)

Xf ^ 2 + Yf ^ 2 + Zf ^ 2 - (Xc * Xf + Yc * Yf + Zc * Zf)
= (Xf * Xp + Yf * Yp + Zf * Zp) - (Xc * Xp + Yc * Yp + Zc * Zp)
= Xp * (Xf - Xc) + Yp * (Yf - Yc) + Zp * (Zf - Zc)

summary:

dot(Pf) - dot(Pc, Pf) = dot(Pp, (Pf - Pc))
```

## Summary

### for one line
  ```
  Xp(Ye - Yc) - Yp(Xe - Xc) = XcYe - XeYc
  Xp(Ze - Zc) - Zp(Xe - Xc) =  XcZe - XeZc
  Yp(Zc - Ze) - Zp(Yc - Ye) = ZcYe - ZeYc
  ```

### for on the plane
  ```
  dot(Pf) - dot(Pc, Pf) = dot(Pp, (Pf - Pc))
  |Pf| - Pc·Pf = Pp·(Pf - Pc)

  ```
### 4 consitions.
  ```
  set T = |Pf| - Pc·Pf = Xf ^ 2 + Yf ^ 2 + Zf ^ 2 - XcXf - YcYf - ZcZf

  Xp(Ye - Yc) - Yp(Xe - Xc) = XcYe - XeYc

  Xp(Ze - Zc) - Zp(Xe - Xc) =  XcZe - XeZc
  >>> Zp = (Xp(Ze - Zc) - (XcZe - XeZc)) / (Xe - Xc)

  Yp(Zc - Ze) - Zp(Yc - Ye) = ZcYe - ZeYc
  >>> put in
    Yp(Zc - Ze) - (Xp(Ze - Zc) - (XcZe - XeZc)) * (Yc - Ye) / (Xe - Xc) = ZcYe - ZeYc

  Xp(Xf - Xc) + Yp(Yf - Yc) + Zp(Zf - Zc) = T 

  Zp = (T - Xp(Xf - Xc) - Yp(Yf - Yc)) / (Zf - Zc)
  >>> put in
    (Xp(Ze - Zc) - (XcZe - XeZc)) / (Xe - Xc) = (T - Xp(Xf - Xc) - Yp(Yf - Yc)) / (Zf - Zc)

    (Xp(Ze - Zc) - (XcZe - XeZc)) * (Zf - Zc) =  (T - Xp(Xf - Xc) - Yp(Yf - Yc)) * (Xe - Xc)


    Xp ((Ze - Zc) + (Xf - Xc)(Xe - Xc)) + Yp((Yf - Yc) (Xe - Xc)) = T(Xe - Xc) + (XcZe - XeZc)) * (Zf - Zc)
    Xp(Ye - Yc)(Yf - Yc) - Yp(Yf - Yc)(Xe - Xc) = (XcYe - XeYc)(Yf - Yc)
    +:
    Xp((Ze - Zc) + (Xf - Xc)(Xe - Xc) + (Ye - Yc)(Yf - Yc)) 
      = T(Xe - Xc) + (XcZe - XeZc)) * (Zf - Zc) + (XcYe - XeYc)(Yf - Yc)

    Xp
      = T(Xe - Xc) + (XcZe - XeZc)) * (Zf - Zc) + (XcYe - XeYc)(Yf - Yc) 
          / ((Ze - Zc) + (Xf - Xc)(Xe - Xc) + (Ye - Yc)(Yf - Yc)) 

    Yp = (Xp(Ye - Yc) - (XcYe - XeYc)) / (Xe - Xc)
    Zp = 

  Xp(Ze - Zc) - Zp(Xe - Xc) =  XcZe - XeZc
  Yp(Zc - Ze) - Zp(Yc - Ye) = ZcYe - ZeYc

  ```

## on the line

((Pc - Pp) · (Pp - Pe)) === |(Pc - Pp)| * |(Pp - Pe)|

((Xc - Xp)(Xp - Xe) + (Yc - Yp)(Yp - Ye) + (Zc - Zp)(Zp - Ze))^2
=
((Xc - Xp) ^ 2 + (Yc - Yp)^2 + (Zc - Zp)^2)
*
((Xp - Xe) ^ 2 + (Yp - Ye)^2 + (Zp - Ze)^2)

## on the plane
|Pf| - Pc·Pf = Pp·(Pf - Pc)

## 
ratio = fl / Z
Zp = fl
Xp = X * fl / Z
Yp = Y * fl / Z

(X', Y', Z') = T(X, Y, Z)

Where: Left Coordinates: 

Camera's Center:  O = (0, 0, 0) = T((Xc, Yc, Zc)) is Origin
Camera's Focal, Z axis: (0, 0, fl) = T((Xf, Yf, Zf)) 
Camera's X axis:  O -> (w, 0, 0) = T((Xleft, Yleft, Zleft)) 
Camera's Y axis:  O -> (0, h, 0) = T((Xtop, Ytop, Ztop)) 

V((0,0,0), (0,0,fl)) is the Z axis' direction.

Camera's Coordnates: 

1. Tanslates: (0, 0, 0) -> (Xc, Yc, Zc)
  ```
  (X',Y',Z') = (X - Xc, Y - Yc, Z - Zc)
  ```
2. rotates:   
  - X axis: V(1, 0, 0) -> V(Xleft, Yleft, Zleft)
  ```
  angle = acos dot(V(1, 0, 0), V(Xleft, Yleft, Zleft)) / d(V(Xleft, Yleft, Zleft))
  (X', Y', Z') = ()
  ```
  - Y axis: V(0, 1, 0) -> V(Xtop, Ytop, Ztop)
  - Z axis: V(0, 0, 1) -> V(Xf, Yf, Zf)


## TODO:

1. z-index. done!
2. distance scale computation. done!
3. body's self-rotation.
4. earth-moon, saturn & jupiter's moons.
5. fill performance. done!