// export
module.exports = Simulation

function Simulation(plotter, controller) {
  this.plotter = plotter
  this.controller = controller
  this.updateInterval = 0.01 //s
}

Simulation.prototype = {

  setup : function() {
    this.frameNo = 0;
    var x = 0.5
    var y = 0.3 // 3/4 is max
    var dir = -Math.PI/2
    this.kite = new KiteComponent(x, y, dir, this.controller)
    this.draw()
  },

  start : function() {
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
    this.updateLogic(0.01)
    this.draw()
  },

  updateLogic : function(dt) { // seconds
    this.frameNo += 1
    this.kite.update(dt)

    if (this.kite.outOfBounds()) {
      this.gameOver(false)
    }
    if (this.frameNo == 1000) {
      this.gameOver(true) // sucessfully ended the game
    }
  },

  draw : function() {
    this.plotter.clear()
    this.plotter.plotKite(this.kite.x, this.kite.y, this.kite.direction)
  },

  gameOver : function(success) {

    clearInterval(this.interval)

    this.pause(500)
    .then(function () {
      simulation.setup()
      return simulation.pause(500)
    })
    .then( function() {
      simulation.start()
    })
  },
}

function Motor() {
  this.pos = 0 // value from 1000 to 0
  this.speed = 4000 // pos per second // missing acceleration
  this.omegaDot = 0

  this.update = function( targetPos, dt ) {
    if (targetPos != this.pos) {
      this.pos += Math.sign( targetPos - this.pos) * Math.min(this.speed*dt, Math.abs(targetPos - this.pos));
      this.omegaDot = this.pos * 0.00314; // change up for 5 degrees per increment
    }
  }
}

function KiteComponent(x, y, dir, controller) {
  this.x = x
  this.y = y
  this.direction = dir
  this.velocity = 0.25 // units per second
  this.controller = controller

  this.motor = new Motor()

  this.update = function(dt) {
    this.motor.update(this.controller.motorPos(this.x, this.y, this.direction, this.velocity), dt)
    this.direction += this.motor.omegaDot*dt;
    this.x += Math.cos(this.direction) * this.velocity * dt;
    this.y += Math.sin(this.direction) * this.velocity * dt;
  }

  this.outOfBounds = function() {
    return (this.x < 0 || this.x > 1 || this.y < 0 || this.y > 3/4)
  }

  this.generateTrace = function(canvas, maxStep) {
    var position = [];
    for (var i=0; i< maxStep; i++) {
      position.push([this.x, this.y])
      this.newPos(this.network.activate(this.normInput(canvas))[0]*1000)
      if (this.outOfBounds(canvas)) {
        break
      }
    }
    return position
  }
}

function merge() {
    var obj, name, copy,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length;

    for (; i < length; i++) {
        if ((obj = arguments[i]) != null) {
            for (name in obj) {
                copy = obj[name];

                if (target === copy) {
                    continue;
                }
                else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }

    return target;
}
