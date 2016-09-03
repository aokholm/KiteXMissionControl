module.exports = Plotter


function Plotter(id, width, height) {
  this.canvas = document.createElement("canvas")
  this.canvas.width = width
  this.canvas.height = height
  this.context = this.canvas.getContext("2d")
  this.container = document.getElementById(id)
  this.container.appendChild(this.canvas)
}

Plotter.prototype = {
  plotLine: function(line, color) {
    // draw the kite
    this.context.strokeStyle = "#000000";
    if (color) {
      this.context.strokeStyle = "#" + color;
    }

    line = line.map(function(p) {return [p[0]*this.canvas.width, (1-p[1])*this.canvas.height]}, this)

    this.context.lineWidth=1;
    this.context.beginPath();
    this.context.moveTo(line[0][0], line[0][1]);

    for (var i = 1; i < line.length; i++) {
      this.context.lineTo(line[i][0], line[i][1]);
    }
    this.context.stroke();
  },

  plotKite: function(x, y, dir) {
    this.context.fillStyle = "red";
    this.context.save(); // save the unrotated context of the canvas so we can restore it later
    this.context.translate(x*this.canvas.width, (1-y)*this.canvas.height); // move to the point of the kite
    this.context.rotate(dir); // rotate the canvas to the specified degrees

    // draw the kite
    this.context.beginPath();
    this.context.moveTo(-2, 4);
    this.context.lineTo(0,-4);
    this.context.lineTo(2, 4);
    this.context.closePath();
    this.context.fill();

    this.context.restore(); // we’re done with the rotating so restore the unrotated ctx
  },

  clear : function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
}
