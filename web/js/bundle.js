/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var SystemController = __webpack_require__(1)

	var systemController = new SystemController()


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = SystemController

	var Plotter = __webpack_require__(2).Plotter
	var WebSocketController = __webpack_require__(4)
	var PurePursuitController = __webpack_require__(5)
	var KitePositionSystem = __webpack_require__(6)
	var MotorController = __webpack_require__(7)
	var TrackGenerator = __webpack_require__(8)
	var Logger = __webpack_require__(9)
	var Tracks = __webpack_require__(10)
	var Sessions = __webpack_require__(11)

	function SystemController() {

	  this.webSocketController = new WebSocketController()
	  this.purePursuitController = new PurePursuitController()
	  this.trackingPlot = new Plotter("trackingPlot", 400, 300)
	  this.imagePlot = new Plotter("imagePlot", 640, 480)
	  this.trackGenerator = new TrackGenerator("trackGenerator", this.trackingPlot)
	  this.kitePositionSystem = new KitePositionSystem()
	  this.motorController = new MotorController("motorController")
	  this.logger = new Logger()
	  this.tracks = new Tracks("tracks", this.purePursuitController)
	  this.sessions = new Sessions("sessions")

	  this.state = {
	    motor: false,
	    ai: false,
	    logging: false
	  }

	  this.setup()
	  this.setupKeyEvents()
	  this.setupUI()

	  this.updateInterval = 0.02
	  this.interval = setInterval(this.plot.bind(this), this.updateInterval*1000)
	}


	SystemController.prototype = {
	  setup: function() {

	    var self = this

	    this.webSocketController.onBinaryKinematic = function(data) {
	      var kinematic = KitePositionSystem.kinematicRaw2Dict(data)
	      self.kitePositionSystem.newTrackingData(kinematic)
	    }

	    this.webSocketController.onBinaryImage = function(data) {
	      var png = new PNG(new Uint8Array(data))
	      self.imagePlot.plotPNG90(png)
	    }

	    this.kitePositionSystem.onKinematic = function(k) {
	      self.purePursuitController.newKinematic(k)
	      self.trackingPlot.plotPoints([[k[0]*400, k[1]*400]])
	      self.logger.newKinematic(k)
	    }

	    this.purePursuitController.onCurvature = function(curvature) {
	      if (self.state.ai) {
	        self.motorController.moveTo(MotorController.curvatureToPos(curvature))
	      }
	    }

	    this.purePursuitController.onTrack = function(track) {
	      self.trackingPlot.plotLineNormalized(track)
	    }

	    this.motorController.onMovingToAbsolute = function(position) {
	      self.webSocketController.sendMotorPosition(position)
	    }

	    this.motorController.onMovingToRelative = function(position) {
	      self.kitePositionSystem.motorMovingTo(position)
	      self.logger.newControl(position)
	    }

	    this.trackGenerator.onChange = function() {
	      self.tracks.load()
	    }

	    this.webSocketController.connect()
	  },

	  setupKeyEvents: function() {
	    /** Key press  **/
	    var self = this

	    document.onkeypress = function (e) {
	        var charCode = (typeof e.which == "number") ? e.which : e.keyCode

	        if (charCode === 97) { // a
	          self.toggleAI()
	        }

	        if (charCode === 108) { // l
	          self.toggleLogging()
	        }

	        if (charCode === 109) { // m
	          self.toggleMotor()
	        }

	        if (charCode === 122) { // z
	          self.motorController.zero()
	        }

	        if (charCode === 115) { // s
	          self.webSocketController.ws.send("camera,capture")
	        }
	    }
	  },

	  setupUI: function() {
	    this.ui = {}
	    this.ui.aiBox = document.getElementById("aiBox")
	    this.ui.loggingBox = document.getElementById("loggingBox")
	  },

	  plot: function() {
	    this.trackingPlot.clear()
	    this.trackingPlot.plotLineNormalized(this.kitePositionSystem.trackExtrapolation, {color: "#666"})
	    this.trackingPlot.plotPointsNormalized(this.kitePositionSystem.track, {color: "#66F"})
	    if (this.purePursuitController.hasTrack()) {
	      this.trackingPlot.plotLineNormalized(this.purePursuitController.track, {color: "#000"})
	      this.trackingPlot.plotPointsNormalized([this.purePursuitController.point()], {color: "#F00"})
	    }
	    if (this.trackGenerator.hasTrack()) {
	      this.trackingPlot.plotLine(this.trackGenerator.getTrackUnnormalized(), {color: "#F00"})
	    }

	  },

	  toggleAI: function() {
	    this.state.ai = !this.state.ai
	    this.ui.aiBox.checked = this.state.ai
	  },

	  toggleMotor: function() {
	    this.state.motor = !this.state.motor
	    this.state.motor ? this.webSocketController.ws.send('motor,on') : this.webSocketController.ws.send('motor,off')
	  },

	  toggleLogging: function() {
	    this.state.logging = !this.state.logging
	    this.ui.loggingBox.checked = this.state.logging

	    if (this.state.logging) {
	      this.logger.start()
	    } else {
	      this.logger.stop()
	      this.logger.save()
	    }
	  }
	}


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	  Plotter: Plotter,
	  Plot: Plot
	}

	var util = __webpack_require__(3)
	var merge = util.merge
	var button = util.button

	function Plotter(id, width, height) {
	  Plot.call(this, width, height)

	  this.container = document.getElementById(id)
	  this.container.appendChild(this.canvas)
	}

	function Plot(width, height) {
	  this.canvas = document.createElement("canvas")
	  this.canvas.width = width
	  this.canvas.height = height
	  this.context = this.canvas.getContext("2d")
	}

	Plot.prototype = {
	  plotLineNormalized: function(line, options) {
	    line = line.map(function(p) {return [p[0]*this.canvas.width, p[1]*this.canvas.width]}, this)
	    this.plotLine(line, options)
	  },

	  plotLineNormalize: function(line, options) {
	    this.plotLine(this.normalize(line, options), options)
	  },

	  normalize: function(points, options) {
	    var xs = points.map(function(p){return p[0]})
	    var ys = points.map(function(p){return p[1]})
	    var xmin = options.xmin || Math.min(...xs)
	    var xmax = options.xmax || Math.max(...xs)
	    var ymin = options.ymin || Math.min(...ys)
	    var ymax = options.ymax || Math.max(...ys)
	    console.log(xmin, xmax, ymin, ymax);

	    points = points.map(function(p) {
	      return [
	        (p[0]-xmin) / (xmax - xmin ) * this.canvas.width,
	        (1- (p[1]-ymin) / (ymax - ymin ) ) * this.canvas.height
	      ]}, this)

	    return points
	  },

	  plotPointsNormalized: function(line, options) {
	    line = line.map(function(p) {return [p[0]*this.canvas.width, p[1]*this.canvas.width]}, this)
	    this.plotPoints(line, options)
	  },

	  plotPointsNormalize: function(points, options) {
	    this.plotPoints(this.normalize(points, options), options)
	  },

	  plotPoints: function(points, options) {
	    var options = options || {}
	    this.context.fillStyle = options.color || "#000000"
	    for (p of points) {
	      this.context.fillRect(p[0]-1, p[1]-1, 3, 3)
	    }

	  },

	  plotLine: function(line, options) {
	    // draw the line

	    if (line.length < 2) { return }
	    var ops = options || {}
	    this.context.strokeStyle = ops.color || "#000000"

	    this.context.lineWidth=1;
	    this.context.beginPath();
	    this.context.moveTo(line[0][0], line[0][1]);

	    for (var i = 1; i < line.length; i++) {
	      this.context.lineTo(line[i][0], line[i][1]);
	    }
	    this.context.stroke();
	  },

	  plotKite: function(x, y, dir) {

	    this.context.fillStyle = "red";
	    this.context.save(); // save the unrotated context of the canvas so we can restore it later
	    this.context.translate(x*this.canvas.width, y*this.canvas.width); // move to the point of the kite
	    this.context.rotate(dir); // rotate the canvas to the specified degrees

	    // draw the kite
	    this.context.beginPath();
	    this.context.moveTo(-4, 2);
	    this.context.lineTo(4, 0);
	    this.context.lineTo(-4, -2);
	    this.context.closePath();
	    this.context.fill();

	    this.context.restore(); // we’re done with the rotating so restore the unrotated ctx
	  },

	  clear : function() {
	    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	  },

	  plotPNG90: function(png) {
	    var imgBuffer, imageData, width, height, widthIn, heightIn, k
	    width = this.canvas.width // output image
	    height = this.canvas.height
	    widthIn = height
	    heightIn = width

	    imgBuffer = png.decode()
	    imageData = this.context.createImageData(width, height)

	    // IN
	    // ____
	    // |  |
	    // |  |
	    // ____
	    //
	    // OUT
	    // ______
	    // |    |
	    // ______

	    var kIn = 0
	    for (var hi = 0; hi < heightIn; hi++) {
	      // first row, second row...
	      for (var wi = 0; wi < widthIn; wi++) {
	        // where is first row in new picture
	        var index = ( (height - wi -1) * width + hi) * 4
	        imageData.data[index] = imgBuffer[kIn++]
	        imageData.data[index+1] = imgBuffer[kIn++]
	        imageData.data[index+2] = imgBuffer[kIn++]
	        imageData.data[index+3] = imgBuffer[kIn++]
	      }
	    }

	    this.context.putImageData(imageData, 0, 0)
	  }
	}


	// Set Plotter's prototype to Plot's prototype
	Plotter.prototype = Object.create(Plot.prototype);

	// Set constructor back to Plotter
	Plotter.prototype.constructor = Plotter


/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = {
	  get: get,
	  deleteItem: deleteItem,
	  post: post,
	  button: button,
	  merge: merge,
	  slider: slider
	}

	function get(path) {
	  return genericRequest(path, "GET")
	}

	function deleteItem(path) {
	  return genericRequest(path, "DELETE")
	}

	function genericRequest(path, method) {
	  return new Promise( function(resolve, reject) {
	    var xhr = new XMLHttpRequest();
	    xhr.open(method, path, true)
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


	function post(path, object) {
	  return new Promise( function(resolve, reject) {
	    var xhr = new XMLHttpRequest();
	    xhr.open("POST", path)
	    xhr.setRequestHeader('Content-Type', 'application/json');
	    xhr.onload = function (e) {
	      if (xhr.readyState === 4) {
	        if (xhr.status === 200) {
	          resolve()
	        } else {
	          reject(xhr.statusText)
	        }
	      }
	    }
	    xhr.onerror = function (e) {
	      reject(xhr.statusText)
	    }
	    xhr.send(JSON.stringify(object))
	  })
	}

	function button(text, action) {
	  var button = document.createElement("button")
	  button.innerHTML = text
	  button.addEventListener('click', action, false);
	  return button
	}

	function slider(onInputCallback, options) {
	  var slider = document.createElement("input")
	  var defaults = {
	    type: "range",
	    min: 0,
	    max: 1000,
	    step: 1,
	    style: "width:400px"
	  }
	  options = merge(defaults, options || {})

	  for (var key in options) {
	    slider.setAttribute(key, options[key])
	  }

	  slider.addEventListener("input", function() { onInputCallback(slider.value) })
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


/***/ },
/* 4 */
/***/ function(module, exports) {

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
	        if (msg.data.byteLength === 24) {
	          if (self.onBinaryKinematic) { self.onBinaryKinematic(new Float64Array(msg.data)) }
	        } else {
	          if (self.onBinaryImage) { self.onBinaryImage(msg.data) }
	        }
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


/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = PurePursuitController

	function PurePursuitController() {
	  this.onCurvature = function(){}
	  this.onTrack = function(){}
	  this.currentPoint = 0
	  this.lad = 0.15 // look ahead distance //TODO could be dynamic dependen on speed
	  this.track = []
	}

	PurePursuitController.prototype = {
	  loadTrack: function(track) {
	    this.track = track
	    this.reset()
	    this.onTrack(track)
	  },

	  reset: function() {
	    this.currentPoint = 0
	  },

	  hasTrack: function() {
	    return this.track.length > 0
	  },

	  newKinematic: function(kinematic) {
	    if (this.track.length == 0) { return }

	    var kPos = [kinematic[0], kinematic[1]], omega = kinematic[2]

	    // iterate until a point is outside Look ahead distance
	    var l = this.distance(this.point(), kPos)

	    var loopCount = 0
	    while (l < this.lad && loopCount < this.track.length) {
	      this.next()
	      l = this.distance(this.point(), kPos)
	      loopCount += 1
	    }

	    if (l < this.lad) { return }

	    omega = (omega + 100*Math.PI) % (2*Math.PI) // works for up to 50 negative rotations

	    var theta_e = (this.angleToPoint(this.point(), kPos) - omega) % (2*Math.PI)// should concider warp arround

	    if (theta_e < -Math.PI) {
	      theta_e += 2*Math.PI
	    }
	    if (theta_e > Math.PI) {
	      theta_e -= 2*Math.PI
	    }
	    var gamma = 2*theta_e / l // gamme is the curvature
	    this.onCurvature(gamma)
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


/***/ },
/* 6 */
/***/ function(module, exports) {

	// export
	module.exports = KitePositionSystem

	function KitePositionSystem() {
	  this.onKinematic = function() {} // do something epic
	  this.updateInterval = 0.02 //s
	  this.lbd = 0.03 // look back distance
	  this.lbdMax = 0.1 // velocity and direction
	  this.minDt = 0.03
	  this.resetCount = 0
	  this.trackExtrapolationBufferSize = 100
	  this.trackBufferSize = 100
	  this.setup()
	  this.start()
	}

	KitePositionSystem.prototype = {

	  setup : function() {
	    var x = 0.5
	    var y = 0.5 // 3/4 is max
	    var dir = -Math.PI/2
	    this.kite = new KiteSimulator(x, y, dir)
	    this.motor = new MotorSimulator()
	    this.kite.velocity = 0 // hmm
	    this.lastTime = 0
	    this.timeOffset = 0
	    this.trackExtrapolation = []
	    this.track = []
	  },

	  start : function() {
	    console.log("Start KitePositionSystem");
	    this.interval = setInterval(this.loop.bind(this), this.updateInterval*1000)
	  },

	  stop : function() {
	    clearInterval(this.interval)
	  },

	  loop : function() {
	    var timestamp = Date.now() / 1000
	    this.update(timestamp)
	  },

	  update : function(timestamp) { // seconds
	    // update estimated position
	    var dt = timestamp - this.lastTime

	    this.kite.updateExpectedPosition(this.motor.omegaDot, dt) // kite and motor
	    this.motor.updateExpectedPosition(dt)

	    // add point to trackExtrapolation
	    this.trackExtrapolation.push([this.kite.x, this.kite.y, timestamp])
	    this.lastTime = timestamp

	    this.onKinematic(this.kite.kinematic())

	    if (this.trackExtrapolation.length == this.trackExtrapolationBufferSize) {
	      this.trackExtrapolation.shift()
	    }

	  },

	  newTrackingData: function(kinematic) {
	    var kPos = [kinematic.pos.x, kinematic.pos.y, Date.now() / 1000]
	    this.track.push(kPos)

	    var index = this.track.length-2
	    if (index < 0) { return }

	    var l = this.distance(kPos, this.track[index])
	    var dt = this.deltaT(kPos, this.track[index])

	    while (l < this.lbd || dt < this.minDt) {
	      index -= 1
	      if (index < 0) { return }
	      l = this.distance(kPos, this.track[index])
	      dt = this.deltaT(kPos, this.track[index])
	    }

	    var omega = this.angleToPoint(kPos, this.track[index])
	    var vel = l / dt

	    this.kite.x = kPos[0]
	    this.kite.y = kPos[1]
	    this.lastTime = kPos[2]

	    if (l < this.lbdMax) {
	      this.kite.direction = omega
	      this.kite.velocity = vel
	    }

	    if (this.track.length == this.trackBufferSize) {
	      this.track.shift()
	    }
	  },

	  motorMovingTo: function(pos) {
	    this.motor.moveTo(pos)
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

	  deltaT: function(p1, p2) {
	    return p1[2] - p2[2]
	  },

	  setVelocity: function(vel) {
	    this.kite.velocity = vel
	  }

	}

	KitePositionSystem.kinematicRaw2Dict = function(r) {
	  // raw is a 64bit typed array
	  return {
	    time: r[0],
	    pos: {
	      x: r[1],
	      y: r[2], // TODO: normalize in iOS app?
	    }
	  }
	}

	function MotorSimulator() {
	  this.pos = 0 // value from 1000 to 0
	  this.speed = 8000 // pos per second // missing acceleration
	  this.omegaDot = 0
	  this.targetPos = 0

	  this.moveTo = function(targetPos) {
	    this.targetPos = targetPos
	  }

	  this.updateExpectedPosition = function(dt) {
	    if (this.targetPos != this.pos) {
	      this.pos += Math.sign( this.targetPos - this.pos) * Math.min(this.speed*dt, Math.abs(this.targetPos - this.pos));
	      this.omegaDot = this.pos * 0.00314; // change up for 5 degrees per increment
	    }
	  }
	}

	function KiteSimulator(x, y, dir) {
	  this.x = x
	  this.y = y
	  this.direction = dir
	  this.velocity = 0 // units per second

	  this.updateExpectedPosition = function(omegaDot, dt) {
	    this.direction += omegaDot*dt;
	    this.x += Math.cos(this.direction) * this.velocity * dt;
	    this.y += Math.sin(this.direction) * this.velocity * dt;
	  }

	  this.outOfBounds = function() {
	    return (this.x < 0 || this.x > 1 || this.y < 0 || this.y > 3/4)
	  }

	  this.kinematic = function() {
	    return [this.x, this.y, this.direction, this.velocity]
	  }
	}


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = MotorController

	slider = __webpack_require__(3).slider

	function MotorController(id) {
	  this.onMovingToRelative = function() {}
	  this.onMovingToAbsolute = function() {}
	  this.motorRelativePos = 0
	  this.motorOffset = 0
	  this.motorAmplitude = 300 // 300 mm +-
	  this.parrentElement = document.getElementById(id)

	  var self = this
	  this.slider = slider(function(value) {
	    self.moveToNormalized(value/1000)
	  })

	  this.parrentElement.appendChild(this.slider)
	}

	MotorController.prototype = {

	  zero: function() {
	    this.motorOffset += this.motorRelativePos
	    this.slider.value = 500 //TODO create slider with the motor controller??
	  },

	  moveTo: function(relativePos) {
	    this.moveToInternal(relativePos)
	    this.slider.value = (relativePos/ ( 2 * this.motorAmplitude * 400/ 40) + 0.5) * 1000
	  },

	  moveToInternal: function(relativePos) {
	    this.motorRelativePos = relativePos
	    var motorAbsPos = relativePos + this.motorOffset // 400 steps pr 40 mm
	    this.onMovingToAbsolute(motorAbsPos)
	    this.onMovingToRelative(relativePos)
	  },

	  moveToNormalized: function(val) {
	    this.moveToInternal( (val*2-1) * this.motorAmplitude * 400 / 40 )
	  }
	}

	MotorController.curvatureToPos = function(curvature) {
	  return curvature * 150 // derived from observations
	}


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = TrackGenerator

	var Util = __webpack_require__(3)
	var button = Util.button
	var post = Util.post

	function TrackGenerator(id, plot) {
	  this.onChange = function() {} // when a track is saved or deleted
	  this.track = [] // reverse order
	  this.flag = false
	  this.plot = plot

	  var self = this


	  var pathTrackingDiv = document.getElementById(id)
	  var ptSave = button("save", function() {
	    self.save()
	  })
	  var ptClear = button("clear", function() {
	    self.reset()
	  })

	  pathTrackingDiv.appendChild(ptSave)
	  pathTrackingDiv.appendChild(ptClear)

	  this.plot.canvas.addEventListener("mousemove", function (e) {
	    self.findxy('move', e)
	    }, false);
	  this.plot.canvas.addEventListener("mousedown", function (e) {
	    self.findxy('down', e)
	  }, false);
	  this.plot.canvas.addEventListener("mouseup", function (e) {
	    self.findxy('up', e)
	  }, false);
	  this.plot.canvas.addEventListener("mouseout", function (e) {
	    self.findxy('out', e)
	  }, false);

	}


	TrackGenerator.prototype = {

	  getTrack: function() {
	    return this.track.map(function(e) {
	      return [e[0]/this.plot.canvas.width, e[1]/this.plot.canvas.width]
	    }, this)
	  },

	  getTrackUnnormalized() {
	    return this.track
	  },

	  hasTrack: function() {
	    return (this.track.length > 0)
	  },

	  reset: function() {
	    this.track = []
	  },

	  findxy: function(res, e) {
	      var point = findPoint(e, this.plot.canvas)
	      if (res == 'down') {
	          this.flag = true
	          this.track.unshift(point)
	      }
	      if (res == 'up' || res == "out") {
	          this.flag = false
	      }

	      if (res == 'move') {
	          if (this.flag) {
	              this.track.push(point)
	          }
	      }
	  },

	  save: function() {
	    var self = this

	    post("/tracks", this.getTrack())
	    .then( function(res) {
	      console.log("Wickied track saved")
	      self.reset() // reset
	      self.onChange()
	    })
	    .catch( function(err) {
	      console.error("Woops", err)
	    })
	  }
	}

	function findPoint(e, canvas) {
	  return [e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop]
	}


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = Logger

	var post = __webpack_require__(3).post

	function Logger() {
	}

	Logger.prototype = {

	  start: function() {
	    this.on = true
	    this.controls = []
	    this.kinematics = []
	  },

	  stop: function() {
	    this.on = false
	  },

	  newKinematic: function(k) {
	      if (this.on) {
	        k.push(Date.now()/1000)
	        this.kinematics.push( k )
	      }
	  },

	  newControl: function(val) {
	      if (this.on) {
	        this.controls.push( {t: Date.now()/1000, p: val})
	      }
	  },

	  save: function() {
	    post("/sessions", {"control": this.controls, "kinematic": this.kinematics})
	    .then( function(res) {
	      console.log("session saved! :)")
	    })
	    .catch( function(err) {
	      console.error("session saved error", err)
	    })
	  }
	}


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = Tracks

	const util = __webpack_require__(3)
	const Plot = __webpack_require__(2).Plot

	function Tracks(id, purePursuitController) {
	  this.parrentElement = document.getElementById(id)
	  this.purePursuitController = purePursuitController

	  this.load()
	}

	Tracks.prototype = {

	  load: function() {
	    // clean up
	    while (this.parrentElement.firstChild) {
	      this.parrentElement.removeChild(this.parrentElement.firstChild);
	    }

	    var self = this
	    util.get("/tracks")
	    .then( function(res) {
	      res.forEach(function(e, i) {
	          Tracks.getTrack(i)
	          .then( function( path ) {
	            var trackElement = new Track(i, path, self, self.purePursuitController)
	            self.parrentElement.appendChild(trackElement)
	          })
	      }, this)
	    })
	    .catch( function(err) {
	      console.error("damit", err)
	    })
	  }
	}

	Tracks.getTrack = function(id) { // promise
	  return util.get("/tracks/" + id)
	}

	Tracks.deleteTrack = function(id) {
	  return util.deleteItem("/tracks/" + id)
	}

	function Track(id, path, tracks, purePursuitController) {
	  var parrentElement = document.createElement("div")

	  var plot = new Plot(80,60)
	  plot.plotLineNormalized(path)
	  parrentElement.appendChild(plot.canvas)

	  var btload = util.button("load", function() {
	    purePursuitController.loadTrack(path)
	  })
	  parrentElement.appendChild(btload)

	  var btDelete = util.button("delete", function() {
	    Tracks.deleteTrack(id)
	    .then( function() {
	      tracks.load()
	    })
	  })
	  parrentElement.appendChild(btDelete)

	  return parrentElement
	}


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = Sessions

	const util = __webpack_require__(3)
	const Plot = __webpack_require__(2).Plot

	function Sessions(id) {
	  this.parrentElement = document.getElementById(id)
	  this.load()
	}

	Sessions.prototype = {

	  load: function() {
	    // clean up
	    while (this.parrentElement.firstChild) {
	      this.parrentElement.removeChild(this.parrentElement.firstChild);
	    }

	    var self = this
	    util.get("/sessions")
	    .then( function(result) {

	      result.forEach(function(e, i) {
	        Sessions.get(i)
	        .then( function( session ) {
	          self.parrentElement.appendChild(new Session(i, session, self))
	        })
	      }, this)

	    })
	    .catch( function(err) {
	      console.error("damit", err)
	    })
	  }
	}

	Sessions.get = function(id) { // promise
	  return util.get("/sessions/" + id)
	}

	Sessions.delete = function(id) {
	  return util.deleteItem("/sessions/" + id)
	}

	function Session(id, session, sessions, purePursuitController) {
	  var parrentElement = document.createElement("div")

	  var plot = new Plot(160,120)
	  console.log(session);

	  plot.plotLineNormalized(session.kinematic)
	  parrentElement.appendChild(plot.canvas)

	  // var btload = util.button("load", function() {
	  //   purePursuitController.loadTrack(path)
	  // })
	  // parrentElement.appendChild(btload)

	  var btDelete = util.button("delete", function() {
	    Sessions.delete(id)
	    .then( function() {
	      sessions.load()
	    })
	  })
	  parrentElement.appendChild(btDelete)

	  return parrentElement
	}


/***/ }
/******/ ]);