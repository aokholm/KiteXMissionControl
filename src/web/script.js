var ai = require("../ai.js")
var KiteControl = require("../kiteControl.js")
var Plotter = require("./plotter.js")
var WebSocketController = require("./WebSocketController.js")

window.wsc = new WebSocketController()

var kiteControl = new KiteControl(ai.network)

wsc.onBinary = function(data) {
  kiteControl.update(KiteControl.kinematicRaw2Dict(data))
}

kiteControl.onUpdate = function(kinematic) {
  var line = kiteControl.lastLineSegment()
  if (line !== null) {
    trackingPlot.plotLine(line)
  }
  trackingPlot.plotKite(kinematic.pos.x, kinematic.pos.y, kinematic.pos.dir)

  // do SOMETHING
  document.getElementById("time").innerHTML = kinematic.time
  document.getElementById("posx").innerHTML = kinematic.pos.x
  document.getElementById("posy").innerHTML = kinematic.pos.y
  document.getElementById("posdir").innerHTML = kinematic.pos.dir
}

window.trackingPlot = new Plotter("trackingPlot", 400, 400)

document.onkeypress = function (e) {
    var charCode = (typeof e.which == "number") ? e.which : e.keyCode

    if (charCode === 97) { // a
      wsc.toggleAI()
    }

    if (charCode === 122) { // z
      wsc.zero()
    }

    if (charCode === 109) { // m

    }

    if (charCode === 100) { // d
      wsc.ws.send("ai,dirDecrement")
    }

    if (charCode === 105) { // i
      wsc.ws.send("ai,dirIncrement")
    }
}

wsc.connect()

function request(path) {
  return new Promise( function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", path, true)
    xhr.onload = function (e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          reject(xhr.statusText)
        }
      }
    }
    xhr.onerror = function (e) {
      reject(xhr.statusText)
    }
    xhr.send(null)
  })
}

var sessionList = document.getElementById("sessionList")
sessionList.onclick = function(e) {
  var index = Array.prototype.indexOf.call(e.target.parentNode.children, e.target)

  request("/sessions/" + index)
  .then( function(result) {
    for (var kinematic of result.kinematic) {
      trackingPlot.plotKite(kinematic.pos.x, kinematic.pos.y, kinematic.pos.dir)
    }

  })
  .catch( function(err) {
    console.error(err, "ouch")
  })
}

request("/sessions")
.then( function(result) {
  for (var session of result) {
    var li = document.createElement("li")
    li.innerHTML = session
    sessionList.appendChild(li)
  }
})
.catch(function(err) {
  console.error("ups", err)
})
