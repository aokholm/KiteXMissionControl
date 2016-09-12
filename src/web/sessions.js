module.exports = Sessions

const util = require("./util.js")
const Plot = require("./plot.js").Plot

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
