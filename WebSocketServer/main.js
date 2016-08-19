var WebSocketServer = require('ws').Server
var jsonfile = require('jsonfile')

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

// function kinematicRaw2Dict(r) {
//   // raw is a 64bit typed array
//   return {
//     time: r[0],
//     pos: {
//       x: r[1],
//       y: r[2],
//       z: r[3]
//     },
//     vel: {
//       x: r[4],
//       y: r[5],
//       z: r[6]
//     },
//     av: r[7]
//   }
// }


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
        // console.log(kinematic.time)
        wss[DEVICES.WEBCONTROL].send(data, {binary: true, masked: true})
      }
      if (logging) {
        // add timestamp
        kinematic['t'] = (new Date() - startTime)/1000
        kinematicLog.push(kinematic)
      }

      break
    case DEVICES.CONTROL:
      controlMotor(data)
      break
    case DEVICES.WEBCONTROL:
      controlMotor(data)
      break
    default:

  }
  // var uint16 = new Uint16Array(new Uint8Array(data).buffer)
  // console.log(wssReverse)
  // ws.send(uint16, {binary: true, masked: true})
}

function controlMotor(data) {
  var raw = new Int16Array(new Uint8Array(data).buffer)
  var newPosition = raw[0]
  console.log(newPosition + " " + newPosition.toString(2))

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






// var WebSocket = require('ws')
// var ws = new WebSocket('ws://localhost:8080/')
//
// ws.on('open', function open() {
//   ws.on('message', (data, flags) => {
//
//     if (flags.binary) {
//       var uint16 = new Uint16Array(new Uint8Array(data).buffer)
//       uint16[0] += 1
//       console.log(uint16[0])
//       ws.send(uint16, {binary: true, masked: true})
//     }
//   })
//   ws.send("id.CONTROL")
//
//   var array = new Uint8Array(2);
//   array[0] = 0
//   array[1] = 0
//   ws.send(array, { binary: true, masked: true });
//
// })
