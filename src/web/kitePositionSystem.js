// export
module.exports = KitePositionSystem

function KitePositionSystem() {
  this.onKinematic = function() {} // do something epic
  this.updateInterval = 0.01 //s
  this.lbd = 0.03 // look back distance
  this.lbdMax = 0.1 // velocity and direction
  this.minDt = 0.03
  this.resetCount = 0
  this.trackExtrapolationBufferSize = 500
  this.trackBufferSize = 500
  this.setup()
  this.start()
}

KitePositionSystem.prototype = {

  setup : function() {
    var x = 0.5
    var y = 0.5 // 3/4 is max
    var dir = -Math.PI/2
    this.kite = new KiteSimulator(x, y, dir)
    this.motor = new MotorSimulator()
    this.kite.velocity = 0 // hmm
    this.lastTime = 0
    this.timeOffset = 0
    this.trackExtrapolation = []
    this.track = []
  },

  start : function() {
    console.log("Start KitePositionSystem");
    this.interval = setInterval(this.loop.bind(this), this.updateInterval*1000)
  },

  stop : function() {
    clearInterval(this.interval)
  },

  loop : function() {
    var timestamp = Date.now() / 1000
    this.update(timestamp)
  },

  update : function(timestamp) { // seconds
    // update estimated position
    var dt = timestamp - this.lastTime

    this.kite.updateExpectedPosition(this.motor.omegaDot, dt) // kite and motor
    this.motor.updateExpectedPosition(dt)

    // add point to trackExtrapolation
    this.trackExtrapolation.push([this.kite.x, this.kite.y, timestamp])
    this.lastTime = timestamp

    this.onKinematic(this.kite.kinematic())

    if (this.trackExtrapolation.length == this.trackExtrapolationBufferSize) {
      this.trackExtrapolation.shift()
    }

  },

  newTrackingData: function(kinematic) {
    var kPos = [kinematic.pos.x, kinematic.pos.y, Date.now() / 1000]
    this.track.push(kPos)

    var index = this.track.length-2
    if (index < 0) { return }

    var l = this.distance(kPos, this.track[index])
    var dt = this.deltaT(kPos, this.track[index])

    while (l < this.lbd || dt < this.minDt) {
      index -= 1
      if (index < 0) { return }
      l = this.distance(kPos, this.track[index])
      dt = this.deltaT(kPos, this.track[index])
    }

    var omega = this.angleToPoint(kPos, this.track[index])
    var vel = l / dt

    this.kite.x = kPos[0]
    this.kite.y = kPos[1]
    this.lastTime = kPos[2]

    if (l < this.lbdMax) {
      this.kite.direction = omega
      this.kite.velocity = vel
    }

    if (this.track.length == this.trackBufferSize) {
      this.track.shift()
    }
  },

  motorMovingTo: function(pos) {
    this.motor.moveTo(pos)
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

  deltaT: function(p1, p2) {
    return p1[2] - p2[2]
  },

  setVelocity: function(vel) {
    this.kite.velocity = vel
  }

}

KitePositionSystem.kinematicRaw2Dict = function(r) {
  // raw is a 64bit typed array
  return {
    time: r[0],
    pos: {
      x: r[1],
      y: ((1-r[2]) * 3/4), // TODO: normalize in iOS app?
    }
  }
}

function MotorSimulator() {
  this.pos = 0 // value from 1000 to 0
  this.speed = 8000 // pos per second // missing acceleration
  this.omegaDot = 0
  this.targetPos = 0

  this.moveTo = function(targetPos) {
    this.targetPos = targetPos
  }

  this.updateExpectedPosition = function(dt) {
    if (this.targetPos != this.pos) {
      this.pos += Math.sign( this.targetPos - this.pos) * Math.min(this.speed*dt, Math.abs(this.targetPos - this.pos));
      this.omegaDot = this.pos * 0.00314; // change up for 5 degrees per increment
    }
  }
}

function KiteSimulator(x, y, dir) {
  this.x = x
  this.y = y
  this.direction = dir
  this.velocity = 0 // units per second

  this.updateExpectedPosition = function(omegaDot, dt) {
    this.direction += omegaDot*dt;
    this.x += Math.cos(this.direction) * this.velocity * dt;
    this.y += Math.sin(this.direction) * this.velocity * dt;
  }

  this.outOfBounds = function() {
    return (this.x < 0 || this.x > 1 || this.y < 0 || this.y > 3/4)
  }

  this.kinematic = function() {
    return [this.x, this.y, this.direction, this.velocity]
  }
}
