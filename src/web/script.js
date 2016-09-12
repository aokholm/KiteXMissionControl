var Plotter = require("./plotter.js")
var WebSocketController = require("./webSocketController.js")
var PurePursuitController = require("./purePursuitController.js")
var KitePositionSystem = require("./kitePositionSystem.js")
var MotorController = require("./motorController.js")
var TrackGenerator = require("./trackGenerator.js")

window.webSocketController = new WebSocketController()

var purePursuitController = new PurePursuitController()

var trackingPlot = new Plotter("trackingPlot", 400, 300)

var trackGenerator = new TrackGenerator("trackGenerator", trackingPlot)

var kitePositionSystem = new KitePositionSystem()

var motorController = new MotorController()

var logger = new Logger()

webSocketController.onBinary = function(data) {
  var kinematic = KitePositionSystem.kinematicRaw2Dict(data)
  kitePositionSystem.newTrackingData(kinematic)
}

kitePositionSystem.onKinematic = function(k) {
  purePursuitController.newKinematic(k)
  trackingPlot.plotPoints([[k[0]*400, k[1]*400]])
  logger.newKinematic(k)
}

purePursuitController.onCurvature = function(curvature) {
  motorController.moveTo(MotorController.curvatureToPos(curvature))
}

motorController.onMovingToAbsolute = function(position) {
  webSocketController.sendMotorPosition(position)
}

motorController.onMovingToRelative = function(position) {
  kitePositionSystem.motorMovingTo(desiredMotorPosition)
  logger.newControl(position)
}




// this.controller.motorPos(this.x, this.y, this.direction, this.velocity)

window.loadTrack = function() {
  purePursuitController.loadTrack(trackGenerator.getTrack())
  purePursuitController.reset()
}


/** Key press  **/

document.onkeypress = function (e) {
    var charCode = (typeof e.which == "number") ? e.which : e.keyCode

    if (charCode === 97) { // a
      webSocketController.toggleAI()
    }

    if (charCode === 122) { // z
      webSocketController.zero()
    }

    if (charCode === 109) { // m
      webSocketController.toggleMotor()
    }

    if (charCode === 100) { // d
      webSocketController.ws.send("ai,dirDecrement")
    }

    if (charCode === 105) { // i
      webSocketController.ws.send("ai,dirIncrement")
    }

    if (charCode === 115) { // s
      webSocketController.ws.send("camera,capture")
    }

    if (charCode === 108) { // l
      webSocketController.toggleLogging()
    }
}

webSocketController.connect()
