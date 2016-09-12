module.exports = Tracks

const util = require("./util.js")
const Plot = require("./plot.js").Plot

function Tracks(id, purePursuitController) {
  this.parrentElement = document.getElementById("tracks")
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
