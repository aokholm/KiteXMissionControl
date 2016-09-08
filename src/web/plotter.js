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
  plotLineNormalized: function(line, options) {
    line = line.map(function(p) {return [p[0]*this.canvas.width, (1-p[1])*this.canvas.height]}, this)
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

  plotPointsNormalize: function(points, options) {
    this.plotPoints(this.normalize(points, options), options)
  },

  plotPoints: function(points, options) {

    this.context.fillStyle = options.color || "#000000"
    for (p of points) {
      this.context.fillRect(p[0]-2, p[1]-2, 4, 4)
    }

  },

  plotLine: function(line, options) {
    // draw the kite
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
    this.context.translate(x*this.canvas.width, y*this.canvas.height); // move to the point of the kite
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
}

function merge() {
    var obj, name, copy,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length;

    for (; i < length; i++) {
        if ((obj = arguments[i]) != null) {
            for (name in obj) {
                copy = obj[name];

                if (target === copy) {
                    continue;
                }
                else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }

    return target;
}
