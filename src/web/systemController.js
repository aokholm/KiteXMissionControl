module.exports = SystemController

var Plotter = require("./plotter.js")
var WebSocketController = require("./webSocketController.js")
var PurePursuitController = require("./purePursuitController.js")
var KitePositionSystem = require("./kitePositionSystem.js")
var MotorController = require("./motorController.js")
var TrackGenerator = require("./trackGenerator.js")
var Logger = require("./logger.js")

function SystemController() {

  this.webSocketController = new WebSocketController()
  this.purePursuitController = new PurePursuitController()
  this.trackingPlot = new Plotter("trackingPlot", 400, 300)
  this.trackGenerator = new TrackGenerator("trackGenerator", this.trackingPlot)
  this.kitePositionSystem = new KitePositionSystem()
  this.motorController = new MotorController("motorController")
  this.logger = new Logger()

  this.state = {
    motor: false,
    ai: false,
    logging: false
  }

  this.setup()
  this.setupKeyEvents()
  this.setupUI()
}


SystemController.prototype = {
  setup: function() {

    var self = this

    this.webSocketController.onBinary = function(data) {
      var kinematic = KitePositionSystem.kinematicRaw2Dict(data)
      self.kitePositionSystem.newTrackingData(kinematic)
    }


    this.kitePositionSystem.onKinematic = function(k) {
      self.purePursuitController.newKinematic(k)
      self.trackingPlot.plotPoints([[k[0]*400, k[1]*400]])
      self.logger.newKinematic(k)
    }

    this.purePursuitController.onCurvature = function(curvature) {
      if (self.state.ai) {
        self.motorController.moveTo(MotorController.curvatureToPos(curvature))
      }

    }

    this.motorController.onMovingToAbsolute = function(position) {
      self.webSocketController.sendMotorPosition(position)
    }

    this.motorController.onMovingToRelative = function(position) {
      self.kitePositionSystem.motorMovingTo(position)
      self.logger.newControl(position)
    }

    var self = this
    window.loadTrack = function() {
      self.purePursuitController.loadTrack(self.trackGenerator.getTrack())
      self.purePursuitController.reset()
    }

    this.webSocketController.connect()
  },

  setupKeyEvents: function() {
    /** Key press  **/
    var self = this

    document.onkeypress = function (e) {
        var charCode = (typeof e.which == "number") ? e.which : e.keyCode

        if (charCode === 97) { // a
          self.toggleAI()
        }

        if (charCode === 108) { // l
          self.toggleLogging()
        }

        if (charCode === 109) { // m
          self.toggleMotor()
        }

        if (charCode === 122) { // z
          self.motorController.zero()
        }

        if (charCode === 115) { // s
          self.webSocketController.ws.send("camera,capture")
        }
    }
  },

  setupUI: function() {
    this.ui = {}
    this.ui.aiBox = document.getElementById("aiBox")
    this.ui.loggingBox = document.getElementById("loggingBox")
  },


  toggleAI: function() {
    this.state.ai = !this.state.ai
    this.ui.aiBox.checked = this.state.ai
  },

  toggleMotor: function() {
    this.state.motor = !this.state.motor
    this.state.motor ? this.webSocketController.ws.send('motor,on') : this.webSocketController.ws.send('motor,off')
  },

  toggleLogging: function() {
    this.state.logging = !this.state.logging
    this.ui.loggingBox.checked = this.state.logging

    if (this.state.logging) {
      this.logger.start()
    } else {
      this.logger.stop()
      this.logger.save()
    }
  }
}
