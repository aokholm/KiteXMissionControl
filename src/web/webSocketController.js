module.exports = WebSocketController

function WebSocketController() {
  this.lastMove = 0 // timer
  this.ai = false
  this.logging = false
  this.motor = false
  this.startTime = 0
  this.onLoggingChanged = function() {}
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
        if (self.onBinary) { self.onBinary(data) }
      } else {
        self.processText(msg.data)
      }
    }

    this.ws.onclose = function() {
      document.getElementById("connectedBox").checked = false
    }
  },

  sendMotorPosition: function(val) {
    // do nothing if last move was less than 25 ms ago
    if(Date.now() - this.lastMove > 25) {
      var buffer = new Int16Array(1)
      buffer[0] = val
      this.ws.send( buffer )
      this.lastMove = Date.now()
    }
  },

  processText: function(data) {
    var input = data.split(',')
    var command = input[0]
    var value = input[1]
    switch (command) {
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
      default:
        console.log(data)
    }
  }
}
