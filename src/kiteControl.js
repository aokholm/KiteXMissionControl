// export
module.exports = KiteControl

// Your code goes here
function KiteControl(network) {
  this.direction = 0
  this.directionCount = 0
  this.dir = 0
  this.network = network
  this.kinematicBuffer = []
  this.bufferSize = 7
  this.autonomous = false
}

KiteControl.prototype = {
  update : function(kinematic) {
    if (this.kinematicBuffer.length == this.bufferSize) {
      this.kinematicBuffer.shift()
    }

    this.kinematicBuffer.push(kinematic)
    if (this.kinematicBuffer.length == this.bufferSize) {
      // calculate direction
      this.dir = this.newDirection(this.kinematicBuffer[0], kinematic)
    }

    kinematic.pos.dir = this.dir

    if (this.onUpdate !== undefined) {
      this.onUpdate(kinematic)
    }
  },

  newDirection : function(k1, k2) { // last, new
    var dx = k2.pos.x - k1.pos.x
    var dy = k2.pos.y - k1.pos.y

    if ((dx*dx+dy*dy) < 0.0008) return // needs to move atleast 2 percet of screen

    var newDir = Math.atan2(dy, dx) // counter clockclock-wise, with positive x as reference

    newDir = Math.PI/2 - newDir
    if (newDir < 0) {
      newDir += 2*Math.PI
    }
    var angleChange = newDir - this.direction

    if (Math.abs(angleChange) > 3/2*Math.PI) {
      this.directionCount -= Math.sign(angleChange)
    }

    this.direction = newDir

    return this.directionCount * 2 * Math.PI + this.direction
  },

  resetRotation : function() {
    this.directionCount = 0
  },

  lastLineSegment : function() {
    var b = this.kinematicBuffer
    if (b.length == this.bufferSize) {
      var prev = b[this.bufferSize - 2]
      var last = b[this.bufferSize - 1]
      return [[prev.pos.x, prev.pos.y], [last.pos.x, last.pos.y]]
    }

    return null
  }

  // predictLineSegments: function(N, motorPosition) {
  //
  //
  //
  // }

}

KiteControl.kinematicRaw2Dict = function(r) {
  // raw is a 64bit typed array
  return {
    time: r[0],
    pos: {
      x: r[1],
      y: r[2],
    }
  }
}
