module.exports = {
  Plotter: Plotter,
  Plot: Plot
}

var util = require('./util.js')
var merge = util.merge
var button = util.button

function Plotter(id, width, height) {
  Plot.call(this, width, height)

  this.container = document.getElementById(id)
  this.container.appendChild(this.canvas)
}

function Plot(width, height) {
  this.canvas = document.createElement("canvas")
  this.canvas.width = width
  this.canvas.height = height
  this.context = this.canvas.getContext("2d")
}

Plot.prototype = {
  plotLineNormalized: function(line, options) {
    line = line.map(function(p) {return [p[0]*this.canvas.width, p[1]*this.canvas.width]}, this)
    this.plotLine(line, options)
  },

  plotLineNormalize: function(line, options) {
    this.plotLine(this.normalize(line, options), options)
  },

  normalize: function(points, options) {
    var xs = points.map(function(p){return p[0]})
    var ys = points.map(function(p){return p[1]})
    var xmin = options.xmin || Math.min(...xs)
    var xmax = options.xmax || Math.max(...xs)
    var ymin = options.ymin || Math.min(...ys)
    var ymax = options.ymax || Math.max(...ys)
    console.log(xmin, xmax, ymin, ymax);

    points = points.map(function(p) {
      return [
        (p[0]-xmin) / (xmax - xmin ) * this.canvas.width,
        (1- (p[1]-ymin) / (ymax - ymin ) ) * this.canvas.height
      ]}, this)

    return points
  },

  plotPointsNormalized: function(line, options) {
    line = line.map(function(p) {return [p[0]*this.canvas.width, p[1]*this.canvas.width]}, this)
    this.plotPoints(line, options)
  },

  plotPointsNormalize: function(points, options) {
    this.plotPoints(this.normalize(points, options), options)
  },

  plotPoints: function(points, options) {
    var options = options || {}
    this.context.fillStyle = options.color || "#000000"
    for (p of points) {
      this.context.fillRect(p[0]-1, p[1]-1, 3, 3)
    }

  },

  plotLine: function(line, options) {
    // draw the line

    if (line.length < 2) { return }
    var ops = options || {}
    this.context.strokeStyle = ops.color || "#000000"

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
    this.context.translate(x*this.canvas.width, y*this.canvas.width); // move to the point of the kite
    this.context.rotate(dir); // rotate the canvas to the specified degrees

    // draw the kite
    this.context.beginPath();
    this.context.moveTo(-4, 2);
    this.context.lineTo(4, 0);
    this.context.lineTo(-4, -2);
    this.context.closePath();
    this.context.fill();

    this.context.restore(); // we’re done with the rotating so restore the unrotated ctx
  },

  clear : function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },

  plotPNG90: function(png) {
    var imgBuffer, imageData, width, height, widthIn, heightIn, k
    width = this.canvas.width // output image
    height = this.canvas.height
    widthIn = height
    heightIn = width

    imgBuffer = png.decode()
    imageData = this.context.createImageData(width, height)

    // IN
    // ____
    // |  |
    // |  |
    // ____
    //
    // OUT
    // ______
    // |    |
    // ______

    var kIn = 0
    for (var hi = 0; hi < heightIn; hi++) {
      // first row, second row...
      for (var wi = 0; wi < widthIn; wi++) {
        // where is first row in new picture
        var index = ( (height - wi -1) * width + hi) * 4
        imageData.data[index] = imgBuffer[kIn++]
        imageData.data[index+1] = imgBuffer[kIn++]
        imageData.data[index+2] = imgBuffer[kIn++]
        imageData.data[index+3] = imgBuffer[kIn++]
      }
    }

    this.context.putImageData(imageData, 0, 0)
  }
}


// Set Plotter's prototype to Plot's prototype
Plotter.prototype = Object.create(Plot.prototype);

// Set constructor back to Plotter
Plotter.prototype.constructor = Plotter
