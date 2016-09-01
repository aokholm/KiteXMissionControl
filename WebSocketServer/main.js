var WebSocketServer = require('ws').Server
var jsonfile = require('jsonfile')
var ai = require('./ai.js')

var wsServer = new WebSocketServer({ port: 8080 })

var logging = false
var kinematicLog = []
var controlLog = []
var sessionName

wsServer.broadcast = data => {
  wsServer.clients.forEach( client => {
    client.send(data);
  });
};

const DEVICES = {
  CAMERA: 'CAMERA',
  CONTROL: 'CONTROL',
  MOTOR: 'MOTOR',
  WEBCONTROL: 'WEBCONTROL'
}

var wss = {}


function KiteControl(network) {
  this.direction = 0
  this.directionCount = 0
  this.network = network
  this.kinematicBuffer = []
  this.bufferSize = 7
  this.autonomous = false
}

KiteControl.prototype = {
  update : function(kinematic) {
    this.kinematicBuffer.push(kinematic)

    if (this.kinematicBuffer.length == this.bufferSize) {
      // calculate direction
      var dir = this.newDirection(this.kinematicBuffer[0], kinematic)

      var controlValue = this.network.activate([kinematic.pos.x, kinematic.pos.y, dir])[0]
      controlValue = (controlValue*2-1) * 100 * 400 / 20

      console.log(controlValue)
      var raw = new Int16Array(1)
      raw[0] = controlValue

      if (DEVICES.WEBCONTROL in wss) { // and feed back data to webcontrol for interface update.
        wss[DEVICES.WEBCONTROL].send("dir," + this.direction , {masked: true})
        wss[DEVICES.WEBCONTROL].send("dirCount," + this.directionCount , {masked: true})
      }

      if (this.autonomous) controlMotor(raw)

      this.kinematicBuffer.shift()

    }
  },

  newDirection : function(k1, k2) {
    var dx = k2.pos.x - k1.pos.x
    var dy = k2.pos.y - k1.pos.y

    if ((dx*dx+dy*dy) < 0.0008) return // needs to move atleast 2 percet of screen

    var newDir = Math.atan2(dy, dx) // counter clockclock-wise, with positive x as reference
    newDir = Math.PI/2 - newDir
    if (newDir < 0) {
      newDir += 2*Math.PI
    }

    var angleChange = newDir - this.direction

    if (Math.abs(angleChange) > 3/2*Math.PI) {
      this.directionCount -= Math.sign(angleChange)
    }

    this.direction = newDir

    return this.directionCount * 2 * Math.PI + this.direction
  },

  resetRotation : function() {
    this.directionCount = 0
  }
}

var kiteControl = new KiteControl(ai.network)

function kinematicRaw2Dict(r) {
  // raw is a 64bit typed array
  return {
    time: r[0],
    pos: {
      x: r[1],
      y: r[2],
    }
  }
}


wsServer.on('connection', ws => {
  ws.on('message', (data, flags) => {
    flags.binary ? processBinary(ws, data) : processText(ws, data)
  })
})

function processBinary(ws, data) {
  switch (ws.deviceId) {
    case DEVICES.CAMERA:
      var raw = new Float64Array(new Uint8Array(data).buffer)
      kinematic = kinematicRaw2Dict(raw)
      // pass on data to webcontrol
      if (DEVICES.WEBCONTROL in wss) {
        wss[DEVICES.WEBCONTROL].send(data, {binary: true, masked: true})
      }
      if (logging) {
        // add timestamp
        kinematic['t'] = (new Date() - startTime)/1000
        kinematicLog.push(kinematic)
      }

      kiteControl.update(kinematic)

      break
    case DEVICES.CONTROL:
      // controlMotor(data)
      var raw = new Int16Array(new Uint8Array(data).buffer)
      var newPosition = raw[0]
      controlMotor(newPosition)
      break
    case DEVICES.WEBCONTROL:
      // controlMotor(data)
      var raw = new Int16Array(new Uint8Array(data).buffer)
      var newPosition = raw[0]
      controlMotor(newPosition)
      break
    default:

  }
  // var uint16 = new Uint16Array(new Uint8Array(data).buffer)
  // console.log(wssReverse)
  // ws.send(uint16, {binary: true, masked: true})
}

function controlMotor(newPosition) {
  // var raw = new Int16Array(new Uint8Array(data).buffer)
  // var newPosition = raw[0]

  var data = new Int16Array(1)
  data[0] = newPosition

  if (DEVICES.MOTOR in wss) {
    // console.log(cam.time)
    wss[DEVICES.MOTOR].send(data, {binary: true, masked: true})
  }

  if (logging) {
    controlLog.push({'t': (new Date() - startTime)/1000, 'p': newPosition})
  }
}



function processText(ws, data) {
  var input = data.split(',')

  command = input[0]
  value = input[1]
  switch (command) {
    case 'id':
      for (var key in DEVICES) {
        if (DEVICES[key] == value.toUpperCase()) {
          wss[DEVICES[key]] = ws
          ws['deviceId'] = DEVICES[key]
        }
      }
      break
    case 'state':
      // let every client know about the state change
      wsServer.broadcast(data)

      // create new session everytime state changes from stop to start
      switch (value) {
        case 'start':
            startSession()
          break
        case 'stop':
            logging = false
            saveSession()
          break
        default:
      }
      break
    case 'motor':
      if (DEVICES.MOTOR in wss) { // pass on commands to the motor controller
        wss[DEVICES.MOTOR].send(data, {masked: true})
      }
      if (DEVICES.WEBCONTROL in wss) { // and feed back data to webcontrol for interface update.
        wss[DEVICES.WEBCONTROL].send(data, {masked: true})
      }
      break
    case 'bat1':
      var batteryVoltage = parseFloat(value)/1024 * 22.19 // V
      if (DEVICES.WEBCONTROL in wss) {
        wss[DEVICES.WEBCONTROL].send("bat1," + batteryVoltage.toString(), {masked: true})
      }
      break
    case 'phoneBat':
      if (DEVICES.WEBCONTROL in wss) {
        wss[DEVICES.WEBCONTROL].send(data, {masked: true})
      }
      break
    case 'camera':
      if (DEVICES.CAMERA in wss) { // pass on commands to the motor controller
        wss[DEVICES.CAMERA].send(data, {masked: true})
      }
      if (DEVICES.WEBCONTROL in wss) { // and feed back data to webcontrol for interface update.
        wss[DEVICES.WEBCONTROL].send(data, {masked: true})
      }
      break
    case 'ai':
      switch (value) {
        case 'on':
            kiteControl.autonomous = true
          break
        case 'off':
            kiteControl.autonomous = false
          break
        case 'resetRotation':
            kiteControl.resetRotation()
          break
        default:
      }
      if (DEVICES.WEBCONTROL in wss) { // and feed back data to webcontrol for interface update.
        wss[DEVICES.WEBCONTROL].send(data, {masked: true})
      }
      break
    default:

  }
  console.log(`received: ${data}`)
}


function saveSession() {
  var file = __dirname + '/sessions/' + sessionName + '.json'
  var obj = {kinematic: kinematicLog, control: controlLog}

  jsonfile.writeFile(file, obj, err => {
    console.error(err)
  })

}

function startSession() {
  sessionName = new Date().toISOString() + "-session"
  startTime = new Date()
  kinematicLog = []
  controlLog = []
  logging = true
}
