module.exports = {
  post: post,
  button: button,
  merge: merge,
  slider: slider
}

function post(path, object) {
  return new Promise( function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", path)
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function (e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve()
        } else {
          reject(xhr.statusText)
        }
      }
    }
    xhr.onerror = function (e) {
      reject(xhr.statusText)
    }
    xhr.send(JSON.stringify(object))
  })
}

function button(text, action) {
  var button = document.createElement("button")
  button.innerHTML = text
  button.addEventListener('click', action, false);
  return button
}

function slider(action) {
  var slider = document.createElement("input")
  var options = {
    type: "range",
    min: 0,
    max: 1000,
    step: 1,
    style: "width:400px"
  }

  for (var key in options) {
    slider.setAttribute(key, options[key])
  }
  slider.addEventListener("input", function() { action(slider.value) })
  return slider
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
