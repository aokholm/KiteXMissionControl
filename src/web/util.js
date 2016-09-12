module.exports = {
  get: get,
  deleteItem: deleteItem,
  post: post,
  button: button,
  merge: merge,
  slider: slider
}

function get(path) {
  return genericRequest(path, "GET")
}

function deleteItem(path) {
  return genericRequest(path, "DELETE")
}

function genericRequest(path, method) {
  return new Promise( function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, path, true)
    xhr.onload = function (e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          reject(xhr.statusText)
        }
      }
    }
    xhr.onerror = function (e) {
      reject(xhr.statusText)
    }
    xhr.send(null)
  })
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

function slider(onInputCallback, options) {
  var slider = document.createElement("input")
  var defaults = {
    type: "range",
    min: 0,
    max: 1000,
    step: 1,
    style: "width:400px"
  }
  options = merge(defaults, options || {})

  for (var key in options) {
    slider.setAttribute(key, options[key])
  }

  slider.addEventListener("input", function() { onInputCallback(slider.value) })
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
