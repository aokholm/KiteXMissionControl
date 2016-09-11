module.exports = Logger

var post = require("./Util.js").post

function Logger() {
}

Logger.prototype = {

  start: function() {
    this.on = true
    this.controls = []
    this.kinematics = []
  },

  newKinematic: function(k) {
      if (this.on) {
        k.t = Date.now()/1000
        this.controls.push( k )
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
