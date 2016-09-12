module.exports = PurePursuitController

function PurePursuitController() {
  this.onCurvature = function(){}
  this.currentPoint = 0
  this.lad = 0.15 // look ahead distance //TODO could be dynamic dependen on speed
}

PurePursuitController.prototype = {
  loadTrack: function(track) {
    this.track = track
  },

  reset: function() {
    this.currentPoint = 0
  },

  hasTrack: function() {
    return (this.track != undefined && this.track.length > 0)
  },

  motorPos: function(x, y, direction, velocity) {
    return this.update([x, y], direction)
  },

  newKinematic: function(kinematic) {
    var kPos = [kinematic[0], kinematic[1]], omega = kinematic[2]

    // iterate until a point is outside Look ahead distance
    var l = this.distance(this.point(), kPos)

    while (l < this.lad) {
      this.next()
      l = this.distance(this.point(), kPos)
    }

    omega = (omega + 100*Math.PI) % (2*Math.PI) // works for up to 50 negative rotations

    var theta_e = (this.angleToPoint(this.point(), kPos) - omega) % (2*Math.PI)// should concider warp arround

    if (theta_e < -Math.PI) {
      theta_e += 2*Math.PI
    }
    if (theta_e > Math.PI) {
      theta_e -= 2*Math.PI
    }
    var gamma = 2*theta_e / l // gamme is the curvature
    this.onCurvature(gamma)
  },

  angleToPoint(pTo, pFrom) {
    var dx = pTo[0] - pFrom[0]
    var dy = pTo[1] - pFrom[1]
    return Math.atan2(dy, dx)
  },

  distance: function(p1, p2) {
    var dx = p1[0] - p2[0]
    var dy = p1[1] - p2[1]
    return Math.sqrt(dx*dx + dy*dy)
  },

  point: function() {
    return this.track[this.currentPoint]
  },

  next: function() {
    this.currentPoint += 1
    if (this.currentPoint == this.track.length) {
      this.currentPoint = 0
    }
    return this.track[this.currentPoint]
  }

}
