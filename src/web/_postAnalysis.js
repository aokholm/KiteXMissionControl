/// NOT ACTIVE



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

// var plotSlider = createSlider({"oninput": "updateLivePlot()"})
// var livePlotData
//
// window.updateLivePlot = function() {
//
//   var fused1 = fuse(livePlotData, plotSlider.value/1000) // up to one second
//   // var fused2 = fuse(result, 0.5)
//   // var fused3 = fuse(result, 1.0)
//   trackingPlot.clear()
//   // trackingPlot.plotPointsNormalize(fused1, {ymax: 10, ymin: -10, color: "222"})
//   trackingPlot.plotPointsNormalize(fused1, {ymax: 20, ymin: -20, color: "222"})
//   // trackingPlot.plotPointsNormalize(fused2, {ymax: 10, ymin: -10, color: "0F0"})
//   // trackingPlot.plotPointsNormalize(fused3, {ymax: 10, ymin: -10, color: "00F"})
// }
//
//
// var sessionList = document.getElementById("sessionList")
// sessionList.appendChild(plotSlider)

var kinematic
var control
var kinematicIndex = 0
var controlIndex = 0

function nextKinematic() {
  kitePS.newTrackingData(kinematic[kinematicIndex])
  console.log(kinematic[kinematicIndex].t);
  if (kinematicIndex < kinematic.length -2 ) { // < 5 ) {
    setTimeout(nextKinematic, (kinematic[kinematicIndex+1].time - kinematic[kinematicIndex].time)*1000)
    kinematicIndex += 1
  }
}

function nextControl() {
  kitePS.newMotorPosition(control[controlIndex])
  if (controlIndex < 5) { //control.length-2) {
    setTimeout(nextControl, (control[controlIndex+1].t - control[controlIndex].t)*1000)
    controlIndex += 1
  }
}

function simulate(session) {
  kinematic = session.kinematic
  control = session.control

  kitePS.stop()
  trackingPlot.clear()



  var kOffset = kinematic[kinematicIndex].time
  var cOffset = -kinematic[0].t

  kinematic = kinematic.map(function(e) {
    e.time -= kOffset
    e.pos.y = (1-e.pos.y)*3/4
    return e
  })
  control = control.map(function(e) {
    e.t -= cOffset
    return e
  })
  //
  setTimeout(function() {
    nextKinematic()
  }, kinematic[0].time)

  // setTimeout(function() {
  //   nextControl()
  // }, control[0].t)


  kitePS.start()

}

sessionList.onclick = function(e) {
  var index = Array.prototype.indexOf.call(e.target.parentNode.children, e.target)

  request("/sessions/" + index)
  .then( function(result) {
    livePlotData = result
    simulate(result)

    // updateLivePlot()


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
