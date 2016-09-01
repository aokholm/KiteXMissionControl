

function KiteControl(network) {
  this.direction = 0
  this.directionCount = 0
  this.network = network
  this.kinematicBuffer = []
  this.bufferSize = 7
}

KiteControl.prototype = {
  update : function(kinematic) {
    this.kinematicBuffer.push(kinematic)

    if (this.kinematicBuffer.length == this.bufferSize) {
      // calculate direction
      var dir = this.newDirection(this.kinematicBuffer[0], this.kinematicBuffer[this.bufferSize-1])
      console.log(dir)
      this.kinematicBuffer.shift()
    }
  },

  newDirection : function(k1, k2) {
    var dx = k2.pos.x - k1.pos.x
    var dy = k2.pos.y - k1.pos.y

    if ((dx*dx+dy*dy) < 0.0008) return // needs to move atleast 2 percet of screen

    var newDir = Math.atan2(dy, dx) // counter clockclock-wise, with positive x as reference
    newDir = Math.PI/2 - newDir
    if (newDir < 0) {
      newDir += 2*Math.PI
    }

    var angleChange = newDir - this.direction

    // console.log(newDir);

    if (Math.abs(angleChange) > 3/2*Math.PI) {
      this.directionCount -= Math.sign(angleChange)
    }

    this.direction = newDir

    return this.directionCount * 2 * Math.PI + this.direction
  }
}

var kiteControl = new KiteControl()

var N = 100
var startingAngle = -2 * 2 * Math.PI
var endAngle = -4 * 2 * Math.PI
var increment = (endAngle - startingAngle) / (N-1)
var thetas = []

for (var i = 0; i < N; i++) {
  thetas.push(startingAngle + i*increment)
}

var kinematics = thetas.map( function (theta) {
  return {
    time: 0,
    pos: {
      x: Math.sin(theta),
      y: Math.cos(theta),
    }
  }
})

for (var i = 0; i < N; i++) {
  kiteControl.update(kinematics[i])
}
