var WebSocketServer = require('ws').Server
var jsonfile = require('jsonfile')
var ai = require('./ai.js')
var KiteControl = require('./kiteControl.js')

var kiteControl = new KiteControl(ai.network)

var wsServer = new WebSocketServer({ port: 8080 })

var logging = false
var kinematicLog = []
var controlLog = []
var sessionName

var motorRelativePos = 0
var motorAbsPos = 0
var motorOffset = 0
var motorAmplitude = 200

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


wsServer.on('connection', ws => {
  ws.on('message', (data, flags) => {
    flags.binary ? processBinary(ws, data) : processText(ws, data)
  })
  ws.on('close', function close() {
    console.log(ws['deviceId'], " disconnected")
    delete wss[ws['deviceId']]
  });
})

function processBinary(ws, data) {
  switch (ws.deviceId) {
    case DEVICES.CAMERA:
      var raw = new Float64Array(new Uint8Array(data).buffer)
      kinematic = KiteControl.kinematicRaw2Dict(raw)
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
      var raw = new Int16Array(new Uint8Array(data).buffer)
      var newPosition = raw[0]
      controlMotor(newPosition)
      break
    case DEVICES.WEBCONTROL:
      var raw = new Int16Array(new Uint8Array(data).buffer)
      var newPosition = raw[0]
      controlMotor(newPosition/1000)
      break
    default:
  }
}

function controlMotor(val) {
  // var raw = new Int16Array(new Uint8Array(data).buffer)
  // var newPosition = raw[0]
  motorRelativePos = (val*2-1) * motorAmplitude * 400 / 40
  motorAbsPos = motorRelativePos + motorOffset // 400 steps pr 40 mm

  var data = new Int16Array(1)
  data[0] = motorAbsPos
  if (DEVICES.MOTOR in wss) {
    // console.log(cam.time)
    wss[DEVICES.MOTOR].send(data, {binary: true, masked: true})
  }

  if (logging) {
    controlLog.push({'t': (new Date() - startTime)/1000, 'p': motorRelativePos})
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
      if (value === "zero") {
        motorOffset += motorRelativePos
      }

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
        case 'dirDecrement':
          console.log("!");
          kiteControl.directionCount -= 1
          break
        case 'dirIncrement':
          kiteControl.directionCount += 1
          break
        default:
      }
      if (DEVICES.WEBCONTROL in wss) { // and feed back data to webcontrol for interface update.
        wss[DEVICES.WEBCONTROL].send(data, {masked: true})
      }
      break
    case 'motorAmplitude':
      motorAmplitude = parseFloat(value)
      break
    default:

  }
  console.log(`received: ${data}`)
}


function saveSession() {
  var file = __dirname + '/../sessions/' + sessionName + '.json'
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

kiteControl.onUpdate = function(kinematic) {
  var controlValue = this.network.activate([kinematic.pos.x, kinematic.pos.y, kinematic.pos.dir])[0]
  if (this.autonomous) controlMotor(controlValue)

  if (DEVICES.WEBCONTROL in wss) { // and feed back data to webcontrol for interface update.
    if (this.autonomous) wss[DEVICES.WEBCONTROL].send("aiControlValue," + controlValue , {masked: true})
    wss[DEVICES.WEBCONTROL].send("dir," + this.direction , {masked: true})
    wss[DEVICES.WEBCONTROL].send("dirCount," + this.directionCount , {masked: true})
  }
}

// TESTING
if (false) {
  var theta = 0
  var offsetx = 0
  var offsety = 0

  setInterval(function () {
    theta += 0.1
    var x = Math.sin(theta)*0.3 + offsetx + 0.5
    var y = Math.cos(theta)*0.3 + offsety + 0.5
    offsetx += (Math.random()-0.5)*2*0.01 - offsetx * 0.1
    offsety += (Math.random()-0.5)*2*0.01 - offsety * 0.1

    var raw = new Float64Array(3)
    raw[1] = x
    raw[2] = y
    // pass on data to webcontrol
    // if (DEVICES.WEBCONTROL in wss) {
    //   wss[DEVICES.WEBCONTROL].send(raw, {binary: true, masked: true})
    // }
    test(raw)

  }, 100)

  function test(raw) {
    kinematic = KiteControl.kinematicRaw2Dict(raw)
    // pass on data to webcontrol
    if (DEVICES.WEBCONTROL in wss) {
      wss[DEVICES.WEBCONTROL].send(raw, {binary: true, masked: true})
    }
    if (logging) {
      // add timestamp
      kinematic['t'] = (new Date() - startTime)/1000
      kinematicLog.push(kinematic)
    }

    kiteControl.update(kinematic)
  }
}

console.log("MISSION CONTROL IS LIVE");