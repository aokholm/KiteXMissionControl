module.exports = WebSocketController

function WebSocketController() {
  // this.controlAmplitude = 200 // +- 300 mm from
  // this.controlOffSet = 0
  // this.controlInput = 0
  this.lastMove = 0 // timer
  this.buffer = new Int16Array(1)
  this.ai = false
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
      // controlInput = (val/500-1) * 400 / 20 * controlAmplitude
      this.buffer[0] = val // + controlOffSet
      this.ws.send( this.buffer )
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
  }
}
