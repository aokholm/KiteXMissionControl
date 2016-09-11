// export
module.exports = KitePS

function KitePS(controller, plotter, newPos) {
  this.plotter = plotter // optional
  this.controller = controller
  this.newPos = newPos // optional
  this.updateInterval = 0.01 //s
  this.lbd = 0.03 // look back distance
  this.lbdMax = 0.05 // velocity and direction
  this.minDt = 0.03
  this.resetCount = 0
  this.setup()
}

KitePS.prototype = {

  setup : function() {
    var x = 0.5
    var y = 0.5 // 3/4 is max
    var dir = -Math.PI/2
    this.kite = new KiteComponent(x, y, dir, this.controller)
    this.kite.velocity = 0 // hmm
    this.lastTime = 0
    this.internalTimer = 0
    this.timeOffset = 0
    this.track = []
    if (this.plotter) { this.draw() }
  },

  start : function() {
    console.log("Start KitePS");
    this.interval = setInterval(this.loop.bind(this), this.updateInterval*1000)
  },

  stop : function() {
    clearInterval(this.interval)
  },

  pause : function(time) {
    return new Promise( function(resolve, reject) {
      setTimeout( function() {
        resolve()
      }, time)
    })
  },

  loop : function() {
    var timestamp = Date.now() / 1000
    this.update(timestamp)
    if (this.plotter) { this.draw() }
    this.internalTimer = timestamp
  },

  update : function(timestamp) { // seconds
    // update estimated position
    var dt = timestamp - this.lastTime

    this.kite.updateExpectedPosition(dt) // kite and motor

    var targePos = this.kite.updateMotorPosition()
    if (this.newPos) {
      this.newPos(targePos)
    }
    // add point to track
    this.track.push([this.kite.x, this.kite.y, timestamp])
    this.lastTime = timestamp
  },

  draw : function() {
    this.plotter.clear()
    this.plotter.plotKite(this.kite.x, this.kite.y, this.kite.direction)
  },

  newTrackingData: function(kinematic) {

    var index = this.track.length-1
    if (index < 0) { return }
    var kPos = [kinematic.pos.x, kinematic.pos.y, Date.now() / 1000]

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

    if (!this.controller.hasTrack()) {
      // update omegadot
    }

    this.kite.x = kPos[0]
    this.kite.y = kPos[1]
    this.lastTime = kPos[2]

    if (l < this.lbdMax) {
      this.kite.direction = omega
      this.kite.velocity = vel
    }
  },

  newMotorPosition: function(pos) {
    this.kite.motor.targetPos = pos
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
  }

}

function Motor() {
  this.pos = 0 // value from 1000 to 0
  this.speed = 8000 // pos per second // missing acceleration
  this.omegaDot = 0
  this.targetPos = 0

  this.update = function(dt) {
    if (this.targetPos != this.pos) {
      this.pos += Math.sign( this.targetPos - this.pos) * Math.min(this.speed*dt, Math.abs(this.targetPos - this.pos));
      this.omegaDot = this.pos * 0.00314; // change up for 5 degrees per increment
    }
  }
}

function KiteComponent(x, y, dir, controller) {
  this.x = x
  this.y = y
  this.direction = dir
  this.velocity = 0 // units per second
  this.controller = controller

  this.motor = new Motor()

  this.updateMotorPosition = function(dt) {
    if (this.controller.hasTrack()) {
      var targetPos = this.controller.motorPos(this.x, this.y, this.direction, this.velocity)
      this.motor.targetPos = targetPos
      return targetPos
    }
  }

  this.updateExpectedPosition = function(dt) {
    this.direction += this.motor.omegaDot*dt;
    this.x += Math.cos(this.direction) * this.velocity * dt;
    this.y += Math.sin(this.direction) * this.velocity * dt;
    this.motor.update(dt)
  }

  this.outOfBounds = function() {
    return (this.x < 0 || this.x > 1 || this.y < 0 || this.y > 3/4)
  }
}
