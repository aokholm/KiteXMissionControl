var ai = require("../ai.js")
var KiteControl = require("../kiteControl.js")

var kiteControl = new KiteControl(ai.network)

function WebSocketController() {
  // this.controlAmplitude = 200 // +- 300 mm from
  // this.controlOffSet = 0
  // this.controlInput = 0
  this.lastMove = 0 // timer
  this.buffer = new Int16Array(1)
}

WebSocketController.prototype = {

  connect: function() {
    // Let us open a web socket
    this.ws = new WebSocket("ws://localhost:8080") // port 82 for control
    this.ws.binaryType = "arraybuffer"

    this.ws.onopen = function() {
      // Web Socket is connected, send data using send()
      document.getElementById("connectedBox").checked = true
      wsc.ws.send("id,WEBCONTROL")
    }

    this.ws.onmessage = function (msg) {
      if(msg.data instanceof ArrayBuffer) {
        var data = new Float64Array(msg.data)
        kiteControl.update(KiteControl.kinematicRaw2Dict(data))
      } else {
        processText(msg.data)
      }
    }

    this.ws.onclose = function() {
      document.getElementById("connectedBox").checked = false
    }
  },

  newControlSliderValue: function(val) {
    // do nothing if last move was less than 25 ms ago
    if(Date.now() - this.lastMove > 25) {
      // controlInput = (val/500-1) * 400 / 20 * controlAmplitude
      this.buffer[0] = val // + controlOffSet
      this.ws.send( buffer )
      this.lastMove = Date.now()
    }
  },

  zero: function() {
    //controlOffSet += controlInput
    this.ws.send('motor,zero') // zero in the WebSocketServer
    document.getElementById("sliderControl").value = 500
  },


  processText: function(data) {
    var input = data.split(',')
    var command = input[0]
    var value = input[1]
    switch (command) {
      case 'state':
        console.log(data)
        switch (value) {
          case 'start':
            document.getElementById("loggingBox").checked = true
            break;
          case 'stop':
            document.getElementById("loggingBox").checked = false
            break;
          default:
        }
      break
      case 'motor':
        console.log(data)
        switch (value) {
          case 'on':
            document.getElementById("motorPowerBox").checked = true
            break;
          case 'off':
            document.getElementById("motorPowerBox").checked = false
            break;
          // case 'online':
          //   document.getElementById("motorConnected").checked = true
          //   break;
          // case 'offline':
          //   document.getElementById("motorConnected").checked = false
          //   break;
          default:

        }
      break
      case 'bat1':
        document.getElementById("bat1").innerHTML = parseFloat(value).toFixed(2)
      break
      case 'phoneBat':
        document.getElementById("phoneBat").innerHTML = (100*parseFloat(value)).toFixed(2)
      break
      case 'camera':
        console.log(data)
        switch (value) {
          case 'on':
            document.getElementById("cameraTrackingBox").checked = true
            break;
          case 'off':
            document.getElementById("cameraTrackingBox").checked = false
            break;
        }
      break
      case 'ai':
        console.log(data)
        switch (value) {
          case 'on':
            document.getElementById("aiBox").checked = true
            break;
          case 'off':
            document.getElementById("aiBox").checked = false
            break;
        }
      break
      case 'dir':
        document.getElementById("dir").innerHTML = parseFloat(value).toFixed(2)
      break
      case 'dirCount':
        document.getElementById("dirCount").innerHTML = parseFloat(value).toFixed(2)
      break

      default:
        console.log(data)
    }
  }
}

kiteControl.onUpdate = function(kinematic) {
  trackingPlot.plotLine(kiteControl.lastLineSegment())

  // do SOMETHING
  document.getElementById("time").innerHTML = time
  document.getElementById("posx").innerHTML = posx
  document.getElementById("posy").innerHTML = posy
}




function Plotter(id, width, height) {
  this.canvas = document.createElement("canvas")
  this.canvas.width = width
  this.canvas.height = height
  this.context = this.canvas.getContext("2d")
  this.container = document.getElementById(id)
}

Plotter.prototype = {
  plotLine: function(line, color) {
    // draw the kite
    this.contet.strokeStyle = "#000000";
    if (color) {
      this.contet.strokeStyle = "#" + color;
    }

    this.contet.lineWidth=1;
    this.contet.beginPath();
    this.contet.moveTo(line[0][0], line[0][1]);

    for (var i = 1; i < line.length; i++) {
      this.contet.lineTo(line[i][0], line[i][1]);
    }
    this.contet.stroke();
  },

  plotKite: function(x, y, dir) {

  }
}

var trackingPlot = new Plotter('trackingPlot', 400, 400)



window.wsc = new WebSocketController()
wsc.connect()
