var Plotter = require("./plotter.js")
var WebSocketController = require("./webSocketController.js")
var PurePursuitController = require("./purePursuitController.js")
var KitePositionSystem = require("./kitePositionSystem.js")
var MotorController = require("./motorController.js")
var TrackGenerator = require("./trackGenerator.js")

window.wsc = new WebSocketController()

var purePursuitController = new PurePursuitController()

var trackingPlot = new Plotter("trackingPlot", 400, 300)

var trackGenerator = new TrackGenerator("trackGenerator", trackingPlot)

var kitePositionSystem = new KitePositionSystem()

kitePositionSystem.onKinematic = function(k) {
  // console.log(k[1])
  trackingPlot.plotPoints([[k[0]*400, k[1]*400]])
}


wsc.onBinary = function(data) {
  var kinematic = KitePositionSystem.kinematicRaw2Dict(data)
  kitePositionSystem.newTrackingData(kinematic)
}


// this.controller.motorPos(this.x, this.y, this.direction, this.velocity)



/** Key press  **/

document.onkeypress = function (e) {
    var charCode = (typeof e.which == "number") ? e.which : e.keyCode

    if (charCode === 97) { // a
      wsc.toggleAI()
    }

    if (charCode === 122) { // z
      wsc.zero()
    }

    if (charCode === 109) { // m
      wsc.toggleMotor()
    }

    if (charCode === 100) { // d
      wsc.ws.send("ai,dirDecrement")
    }

    if (charCode === 105) { // i
      wsc.ws.send("ai,dirIncrement")
    }

    if (charCode === 115) { // s
      wsc.ws.send("camera,capture")
    }

    if (charCode === 108) { // l
      wsc.toggleLogging()
    }
}

wsc.connect()
