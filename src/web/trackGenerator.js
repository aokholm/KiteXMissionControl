module.exports = TrackGenerator

var Util = require("./util.js")
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
