module.exports = Tracks

const util = require("./util.js")

function Tracks(id) {
  this.parrentElement = document.getElementById("tracks")

  util.get("/tracks")
  .then( function(res) {
    console.log(res)
  })
  .catch( function(err) {
    console.error("damit", err)
  })

}

Tracks.prototype = {


}
