var jsonfile = require('jsonfile')
var fs = require('fs')

var path = __dirname + '/sessions'

fs.readdir(path, (err, items) => {
    //console.log(items)

    var last = items.slice(-1)[0]

    var file = path + '/' + last
    jsonfile.readFile(file, (err, obj) => {
      console.dir(obj)
    })

})
//
