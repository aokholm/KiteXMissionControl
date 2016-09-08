module.exports = fuse

function fuse(dataset, controlLag) {
  var kinematic = dataset.kinematic
  var control = dataset.control


  // /*** CONTROL LAG ****/
  // RADIUS
  var radius = []
  for (var i = 1; i < kinematic.length; i++) {
    var diff = kinematic[i].pos.dir - kinematic[i-1].pos.dir
    radius.push( distance(kinematic[i], kinematic[i-1]) / diff   )
  }
  // gamma (curvature)
  var gamma = []
  for (var i = 1; i < kinematic.length; i++) {
    var diff = kinematic[i].pos.dir - kinematic[i-1].pos.dir
    gamma.push( diff / distance(kinematic[i], kinematic[i-1])  )
  }


  // OMEGA DOT
  var omagaDot = []
  for (var i = 1; i < kinematic.length; i++) {
    var diff = kinematic[i].pos.dir - kinematic[i-1].pos.dir
    omagaDot.push( diff / (kinematic[i].time - kinematic[i-1].time )   )
  }



  var controlIndex = []
  var ki = 0
  for (var i = 0; i < control.length-1; i++) {
    while (kinematic[ki].t < control[i+1].t + controlLag && ki < kinematic.length) {
      controlIndex.push(i)
      ki += 1
      if (ki == kinematic.length) {break}
    }
  }

  controlIndex.pop()

  return controlIndex.map( function(e, i){
    return [control[e].p, gamma[i]]
  })

  function distance(k1, k2) {
    var dx = k1.pos.x - k2.pos.x
    var dy = k1.pos.y - k2.pos.y
    return Math.sqrt(dx*dx+dy*dy)
  }


  //*** VELOCITY ***/
  // function vel(k1, k2) {
  //   var dx = k1.pos.x - k2.pos.x
  //   var dy = k1.pos.y - k2.pos.y
  //   var dt = k1.time - k2.time
  //   return Math.sqrt( dx*dx + dy*dy ) / dt
  // }
  //
  //
  // var velocity = []
  // for (var i = 1; i < kinematic.length; i++) {
  //   velocity.push( vel(kinematic[i], kinematic[i-1]) )
  // }
  //
  // return velocity.map( function(e, i) {
  //   return [kinematic[i+1].t, e]
  // })



}
