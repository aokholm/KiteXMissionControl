module.exports = WebSocketController

function WebSocketController() {
  this.lastMove = 0 // timer
  this.ai = false
  this.logging = false
  this.motor = false
  this.startTime = 0
}

WebSocketController.prototype = {

  connect: function() {
    // Let us open a web socket
    var self = this
    this.ws = new WebSocket("ws://localhost:8080") // port 82 for control
    this.ws.binaryType = "arraybuffer"

    this.ws.onopen = function() {
      // Web Socket is connected, send data using send()
      document.getElementById("connectedBox").checked = true
      self.ws.send("id,WEBCONTROL")
    }

    this.ws.onmessage = function (msg) {
      if(msg.data instanceof ArrayBuffer) {
        var data = new Float64Array(msg.data)
        if (self.onBinary !== undefined) {
          self.onBinary(data)
        }
      } else {
        self.processText(msg.data)
      }
    }

    this.ws.onclose = function() {
      document.getElementById("connectedBox").checked = false
    }
  },

  newControlSliderValue: function(val) {
    // do nothing if last move was less than 25 ms ago
    if(Date.now() - this.lastMove > 25 && !this.ai) {
      var buffer = new Int16Array(1)
      buffer[0] = val
      this.ws.send( buffer )
      this.lastMove = Date.now()
    }
  },

  zero: function() {
    this.ws.send('motor,zero') // zero in the WebSocketServer
    document.getElementById("sliderControl").value = 500
  },


  processText: function(data) {
    var input = data.split(',')
    var command = input[0]
    var value = input[1]
    switch (command) {
      case 'logging':
        switch (value) {
          case 'on':
            document.getElementById("loggingBox").checked = true
            break;
          case 'off':
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
      case 'aiControlValue':
        console.log(value);
        document.getElementById("sliderControl").value = parseFloat(value)*1000
        break
      case 'S':
        var val = parseFloat(value)
        if (val < 10000) {
          this.ws.send('S,' + (val+1))
        } else {
          console.log("completed");
          console.log((Date.now() - this.startTime)/10000);
        }
        break
      default:
        console.log(data)
    }
  },

  aiOn: function() {
    this.ai = false
    this.ws.send('ai,on')
  },

  aiOff: function() {
    this.ai = false
    this.ws.send('ai,off')
  },

  toggleAI: function() {
    this.ai = !this.ai
    this.ai ? this.ws.send('ai,on') : this.ws.send('ai,off')
  },

  motorOn: function() {
    this.motor = false
    this.ws.send('motor,on')
  },

  motorOff: function() {
    this.motor = false
    this.ws.send('motor,off')
  },

  toggleMotor: function() {
    this.motor = !this.motor
    this.motor ? this.ws.send('motor,on') : this.ws.send('motor,off')
  },

  loggingOn: function() {
    this.logging = false
    this.ws.send('logging,on')
  },

  loggingOff: function() {
    this.logging = false
    this.ws.send('logging,off')
  },

  toggleLogging: function() {
    this.logging = !this.logging
    this.logging ? this.ws.send('logging,on') : this.ws.send('logging,off')
  }
}
