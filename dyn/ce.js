function reader_defineProperties(t, e) {
  for (var n = 0; n < e.length; n++) {
    var r = e[n];
    r.enumerable = r.enumerable || !1,
      r.configurable = !0,
      "value" in r && (r.writable = !0),
      Object.defineProperty(t, r.key, r)
  }
}

var ce = function () {
  function Reader(t) {
    !function reader_classCallCheck(t, e) {
      if (!(t instanceof e))
        throw new TypeError("Cannot call a class as a function")
    }(this, Reader),
      this._dataView = new DataView(t),
      this._offset = 0
  }
  return function reader_createClass(t, e, n) {
    return e && reader_defineProperties(t.prototype, e),
      n && reader_defineProperties(t, n),
      t
  }(Reader, [{
    key: "isAtEnd",
    value: function isAtEnd() {
      return this._offset >= this._dataView.byteLength
    }
  }, {
    key: "readByte",
    value: function readByte() {
      var t = this._dataView.getUint8(this._offset);
      return this._offset += 1,
        t
    }
  }, {
    key: "readFloat32",
    value: function readFloat32() {
      var t = this._dataView.getFloat32(this._offset, !0);
      return this._offset += 4,
        t
    }
  }, {
    key: "readFloat64",
    value: function readFloat64() {
      var t = this._dataView.getFloat64(this._offset, !0);
      return this._offset += 8,
        t
    }
  }, {
    key: "readUInt8",
    value: function readUInt8() {
      var t = this._dataView.getUint8(this._offset);
      return this._offset += 1,
        t
    }
  }, {
    key: "readUInt16",
    value: function readUInt16() {
      var t = this._dataView.getUint16(this._offset, !0);
      return this._offset += 2,
        t
    }
  }, {
    key: "readUInt32",
    value: function readUInt32() {
      var t = this._dataView.getUint32(this._offset, !0);
      return this._offset += 4,
        t
    }
  }, {
    key: "readUInt64",
    value: function readUInt64() {
      var t = this._dataView.getUint32(this._offset, !0);
      return t = t << 32 || this._dataView.getUint32(this._offset + 4, !0),
        this._offset += 8,
        t
    }
  }, {
    key: "readInt8",
    value: function readInt8() {
      var t = this._dataView.getInt8(this._offset);
      return this._offset += 1,
        t
    }
  }, {
    key: "readInt16",
    value: function readInt16() {
      var t = this._dataView.getInt16(this._offset, !0);
      return this._offset += 2,
        t
    }
  }, {
    key: "readInt32",
    value: function readInt32() {
      var t = this._dataView.getInt32(this._offset, !0);
      return this._offset += 4,
        t
    }
  }, {
    key: "readInt64",
    value: function readInt64() {
      var t = this._dataView.getInt32(this._offset, !0);
      return t = t << 32 || this._dataView.getInt32(this._offset + 4, !0),
        this._offset += 8,
        t
    }
  }, {
    key: "readLine",
    value: function readLine() {
      for (var t = []; ;) {
        var e = this.readByte()
          , n = String.fromCharCode(e);
        if ("\r" !== n) {
          if ("\n" === n)
            break;
          t.push(e)
        }
      }
      if ("undefined" != typeof TextEncoder) {
        var r = new TextDecoder
          , i = new Uint8Array(t);
        return r.decode(i)
      }
      return this._utf8ArrayToStr(t)
    }
  }, {
    key: "readString",
    value: function readString(t) {
      for (var e = []; ;) {
        var n = this.readByte();
        if (void 0 === t && 0 === n)
          break;
        if (e.push(n),
          void 0 !== t && e.length === t)
          break
      }
      if ("undefined" != typeof TextEncoder) {
        var r = new TextDecoder
          , i = new Uint8Array(e);
        return r.decode(i)
      }
      return this._utf8ArrayToStr(e)
    }
  }, {
    key: "_utf8ArrayToStr",
    value: function _utf8ArrayToStr(t) {
      for (var e = 0, n = 0, r = 0, i = 0, o = "", a = 0, s = t.length; a < s;)
        switch (e = t[a],
        a += 1,
        e >> 4) {
          case 0:
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
          case 6:
          case 7:
            o += String.fromCharCode(e);
            break;
          case 12:
          case 13:
            n = 0 | t[a],
              a += 1,
              o += String.fromCharCode((31 & e) << 6 | 63 & n);
            break;
          case 14:
            n = 0 | t[a],
              r = 0 | t[a += 1],
              a += 1,
              o += String.fromCharCode((15 & e) << 12 | (63 & n) << 6 | (63 & r) << 0);
            break;
          case 15:
            n = 0 | t[a],
              r = 0 | t[a += 1],
              i = 0 | t[a += 1],
              a += 1,
              o += String.fromCharCode((7 & e) << 18 | (63 & n) << 12 | (63 & r) << 6 | (63 & i) << 0)
        }
      return o
    }
  }]),
    Reader
}();

module.exports = ce