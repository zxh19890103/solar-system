key: "_loadStars",
  value: function _loadStars() {
    var t = this
    this._loadedPromise = this.getEntity().getScene().getEngine().getDownloader().download(this._url, !0).then(function (e) {
      if ("cancelled" === e.status)
        return Promise.resolve()
      if ("failed" === e.status)
        return Promise.reject(new Error('Failed to load starfield component file "' + e.url + '": ' + e.errorMessage))
      if (!(e.content instanceof ArrayBuffer))
        return Promise.reject(new Error('Failed to load starfield component file "' + e.url + '": Not a binary file.'))
      for (var n = new ce(e.content), r = n.readInt32(), i = [], o = 0; o < r; o++) {
        var s = new he
        s.mag = n.readFloat32(),
          s.absMag = n.readFloat32(),
          s.color.r = n.readByte() / 255,
          s.color.g = n.readByte() / 255,
          s.color.b = n.readByte() / 255,
          s.color.div(s.color, s.color.max()),
          s.position.y = -n.readFloat32(),
          s.position.z = n.readFloat32(),
          s.position.x = n.readFloat32(),
          s.position.rotate(_e, s.position),
          i.push(s)
      }
      for (var l = new Float32Array(3 * i.length), u = new Float32Array(4 * i.length), c = new Uint16Array(i.length), _ = 0; _ < i.length; _++) {
        var h = i[_]
        l[3 * _ + 0] = h.position.x,
          l[3 * _ + 1] = h.position.y,
          l[3 * _ + 2] = h.position.z,
          u[4 * _ + 0] = h.color.r,
          u[4 * _ + 1] = h.color.g,
          u[4 * _ + 2] = h.color.b,
          u[4 * _ + 3] = h.absMag,
          c[_] = _
      }
      t._threeJsGeometry.setAttribute("position", new a.BufferAttribute(l, 3)),
        t._threeJsGeometry.setAttribute("color", new a.BufferAttribute(u, 4)),
        t._threeJsGeometry.setIndex(new a.BufferAttribute(c, 1))
    })
  }
}]),