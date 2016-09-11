var WebSocketServer = require('ws').Server

var wsServer = new WebSocketServer({ port: 8080 })

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
      if (DEVICES.WEBCONTROL in wss) {
        wss[DEVICES.WEBCONTROL].send(data, {binary: true, masked: true})
      }
      break
    case DEVICES.CONTROL:
      if (DEVICES.MOTOR in wss) { // pass on commands to the motor controller
        wss[DEVICES.MOTOR].send(data, {binary: true, masked: true})
      }
      break
    case DEVICES.WEBCONTROL:
      if (DEVICES.MOTOR in wss) { // pass on commands to the motor controller
        wss[DEVICES.MOTOR].send(data, {binary: true, masked: true})
      }
      break
    default:
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
    case 'logging':
      // create new session everytime state changes from stop to start
      if (DEVICES.WEBCONTROL in wss) { // and feed back data to webcontrol for interface update.
        wss[DEVICES.WEBCONTROL].send(data, {masked: true})
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
    default:

  }
  console.log(`received: ${data}`)
}

// TESTING
if (true) {
  var theta = 0
  var offsetx = 0
  var offsety = 0

  setInterval(function () {
    theta += 0.1
    var x = Math.sin(theta)*0.3 + offsetx + 0.5
    var y = Math.cos(theta)*0.3 + offsety + 0.5
    offsetx += (Math.random()-0.5)*2*0.00 - offsetx * 0.1
    offsety += (Math.random()-0.5)*2*0.00 - offsety * 0.1

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
    // pass on data to webcontrol
    if (DEVICES.WEBCONTROL in wss) {
      wss[DEVICES.WEBCONTROL].send(raw, {binary: true, masked: true})
    }
  }
}

console.log("MISSION CONTROL IS LIVE");
