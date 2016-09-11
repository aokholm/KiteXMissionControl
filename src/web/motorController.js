module.exports = MotorController

function MotorController(onChange) {
  this.onChange = onChange // function
  this.motorRelativePos = 0
  this.motorOffset = 0
  this.motorAmplitude = 200 // 200 mm +-
}

MotorController.prototype = {

  zero: function() {
    this.motorOffset += this.motorRelativePos
  },

  moveTo: function(relativePos) {
    this.motorRelativePos = relativePos
    var motorAbsPos = motorRelativePos + motorOffset // 400 steps pr 40 mm
    onChange(motorAbsPos)
  },

  moveToNormalized: function(val) {
    this.newPosition( (val*2-1) * this.motorAmplitude * 400 / 40 )
  }

}
