function load(t) {
  var e = !0;
  if ((2 === this._version || 1 === this._version && "def" === this._name) && (e = 1 === t.readByte()),
    e) {
    for (var n = t.readInt32(), r = 0; r < n; r++) {
      var i = new this._PointClass;
      i.load(t),
        this._points.push(i)
    }
    this._points.length > 0 && (this._interval.min = this._points[0].time,
      this._interval.max = this._points[this._points.length - 1].time)
  } else {
    var o = t.readInt32();
    1 === this._version && (this._numberOfDigits = Math.ceil(Math.log10(o)));
    for (var a = 0; a < o; a++) {
      var s = "";
      s = "def" === this._name ? (a + "").padStart(this._numberOfDigits, "0") : this._name + "_" + (a + "").padStart(this._numberOfDigits, "0");
      var l = new PointSet(this._PointClass, this._version, this._numberOfDigits, s);
      l._interval.min = t.readFloat64(),
        1 === this._version ? l._interval.max = t.readFloat64() : a > 0 && (this._pointSets[a - 1]._interval.max = l._interval.min),
        this._pointSets.push(l)
    }
    2 === this._version && this._pointSets.splice(this._pointSets.length - 1, 1),
      this._pointSets.length > 0 && (this._interval.min = this._pointSets[0]._interval.min,
        this._interval.max = this._pointSets[this._pointSets.length - 1]._interval.max)
  }
  this._loadedState = PointSet.State.LOADED,
    this._accessedTime = Date.now()
}