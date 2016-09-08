var ai = require("../ai.js")
var KiteControl = require("../kiteControl.js")
var Plotter = require("./plotter.js")
var WebSocketController = require("./webSocketController.js")
var Simulation = require("../simulation")
var fuse = require("../analysis/fuse.js")

window.wsc = new WebSocketController()


function MotorController() {
  this.currentPoint = 0
  this.lad = 0.15 // look ahead distance
}

MotorController.prototype = {
  loadTrack: function(track) {
    this.track = track
  },

  motorPos: function(x, y, direction, velocity) {
    return this.update([x, y], direction)
  },

  update: function(kPos, omega) {
    // iterate until a point is outside Look ahead distance
    var l = this.distance(this.point(), kPos)

    while (l < this.lad) {
      this.next()
      l = this.distance(this.point(), kPos)
    }

    omega = (omega + 100*Math.PI) % (2*Math.PI) // works for up to 50 negative rotations

    var theta_e = (this.angleToPoint(this.point(), kPos) - omega) % (2*Math.PI)// should concider warp arround

    if (theta_e < -Math.PI) {
      theta_e += 2*Math.PI
    }
    if (theta_e > Math.PI) {
      theta_e -= 2*Math.PI
    }
    var gamma = 2*theta_e / l

    return gamma*150 // formula derived from observations
  },

  angleToPoint(pTo, pFrom) {
    var dx = pTo[0] - pFrom[0]
    var dy = pTo[1] - pFrom[1]
    return Math.atan2(dy, dx)
  },

  distance: function(p1, p2) {
    var dx = p1[0] - p2[0]
    var dy = p1[1] - p2[1]
    return Math.sqrt(dx*dx + dy*dy)
  },

  point: function() {
    return this.track[this.currentPoint]
  },

  next: function() {
    this.currentPoint += 1
    if (this.currentPoint == this.track.length) {
      this.currentPoint = 0
    }
    return this.track[this.currentPoint]
  }

}

var track = [
  [0.2, 0.2],
  [0.2, 0.5],
  [0.8, 0.2],
  [0.8, 0.5]
]



var motorController = new MotorController()
var kiteControl = new KiteControl(ai.network)
window.trackingPlot = new Plotter("trackingPlot", 400, 400)
window.simulation = new Simulation(trackingPlot, motorController)
simulation.setup()
// simulation.start()

var pathTrackingDiv = document.getElementById("pathTracking")
var ptStart = createButton("start", "startSimulation()")
var ptClear = createButton("clear", "clearTrack()")
pathTrackingDiv.appendChild(ptStart)
pathTrackingDiv.appendChild(ptClear)

window.startSimulation = function() {
  motorController.loadTrack(points.map(function(e) {
    return [e[0]/400, e[1]/400]
  }))
  simulation.start()
}

window.clearTrack = function() {
  points = []
}

wsc.onBinary = function(data) {
  kiteControl.update(KiteControl.kinematicRaw2Dict(data))
}

kiteControl.onUpdate = function(kinematic) {
  var line = kiteControl.lastLineSegment()
  if (line !== null) {
    trackingPlot.plotLineNormalized(line)
  }
  trackingPlot.plotKite(kinematic.pos.x, kinematic.pos.y, kinematic.pos.dir)

  // do SOMETHING
  document.getElementById("time").innerHTML = kinematic.time
  document.getElementById("posx").innerHTML = kinematic.pos.x
  document.getElementById("posy").innerHTML = kinematic.pos.y
  document.getElementById("posdir").innerHTML = kinematic.pos.dir
}


trackingPlot.canvas.addEventListener("mousemove", function (e) {
      findxy('move', e)
  }, false);
trackingPlot.canvas.addEventListener("mousedown", function (e) {
    findxy('down', e)
}, false);
trackingPlot.canvas.addEventListener("mouseup", function (e) {
    findxy('up', e)
}, false);
trackingPlot.canvas.addEventListener("mouseout", function (e) {
    findxy('out', e)
}, false);

var points = [] // reverse order
var flag = false
function findxy(res, e) {
    var point = findPoint(e, trackingPlot.canvas)
    if (res == 'down') {
        flag = true
        points.unshift(point)
    }
    if (res == 'up' || res == "out") {
        flag = false
    }

    if (res == 'move') {
        if (flag) {
            points.unshift(point)
            drawLastSegment()
        }
    }
}

function drawLastSegment() {
  line = [points[0], points[1]]
  trackingPlot.plotLine(line)
}

function findPoint(e, canvas) {
  return [e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop]
}

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




/*** POST ANALYSIS **/
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

var plotSlider = createSlider({"oninput": "updateLivePlot()"})
var livePlotData

window.updateLivePlot = function() {

  var fused1 = fuse(livePlotData, plotSlider.value/1000) // up to one second
  // var fused2 = fuse(result, 0.5)
  // var fused3 = fuse(result, 1.0)
  trackingPlot.clear()
  // trackingPlot.plotPointsNormalize(fused1, {ymax: 10, ymin: -10, color: "222"})
  trackingPlot.plotPointsNormalize(fused1, {ymax: 20, ymin: -20, color: "222"})
  // trackingPlot.plotPointsNormalize(fused2, {ymax: 10, ymin: -10, color: "0F0"})
  // trackingPlot.plotPointsNormalize(fused3, {ymax: 10, ymin: -10, color: "00F"})
}


var sessionList = document.getElementById("sessionList")
sessionList.appendChild(plotSlider)


sessionList.onclick = function(e) {
  var index = Array.prototype.indexOf.call(e.target.parentNode.children, e.target)

  request("/sessions/" + index)
  .then( function(result) {
    livePlotData = result
    updateLivePlot()
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


function createButton(text, action) {
  var button = document.createElement("button")
  button.setAttribute("onclick", action)
  button.innerHTML = text
  return button
}

function createSlider(options) {
  var slider = document.createElement("input")
  var defaults = {
    "type": "range",
    "min": 0,
    "max": 1000,
    "step": 1,
    "style": "width:400px"
  }
  options = merge(defaults, options || {})

  Object.keys(options).forEach( function(key) {
    slider.setAttribute(key, options[key])
  })
  return slider
}


function merge() {
    var obj, name, copy,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length;

    for (; i < length; i++) {
        if ((obj = arguments[i]) != null) {
            for (name in obj) {
                copy = obj[name];

                if (target === copy) {
                    continue;
                }
                else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }

    return target;
}
