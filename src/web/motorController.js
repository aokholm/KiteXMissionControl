module.exports = MotorController

slider = require("./util.js").slider

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
    this.motorRelativePos = relativePos
    var motorAbsPos = relativePos + this.motorOffset // 400 steps pr 40 mm
    this.onMovingToAbsolute(motorAbsPos)
    this.onMovingToRelative(relativePos)
  },

  moveToNormalized: function(val) {
    this.moveTo( (val*2-1) * this.motorAmplitude * 400 / 40 )
  }
}

MotorController.curvatureToPos = function(curvature) {
  return curvature * 150 // derived from observations
}
