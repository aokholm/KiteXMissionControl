module.exports = Logger

var post = require("./util.js").post

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
