'use strict';

const Hapi = require('hapi');
const fs = require('fs')
const Inert = require('inert');
const jsonfile = require('jsonfile')

const sessionsPath = "./sessions/"
const trackPath = "./tracks/"

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    host: 'localhost',
    port: 8000
});

server.register(Inert, () => {});

// Add the route

server.route({
    method: 'GET',
    path:'/',
    handler: function (request, reply) {
        reply.file('./web/index.html');
    }
});

server.route({
    method: 'GET',
    path:'/js/bundle.js',
    handler: function (request, reply) {
      reply.file('./web/js/bundle.js');
    }
});

createGenericRestEndPoint('tracks', trackPath)
createGenericRestEndPoint('sessions', sessionsPath)



// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
})

function createGenericRestEndPoint(baseName, basePath) {

  server.route({
      method: 'GET',
      path:'/' + baseName,
      handler: function (request, reply) {
        console.log(fs.readdirSync(basePath))
        return reply(JSON.stringify(fs.readdirSync(basePath)))
      }
  })

  server.route({
      method: 'GET',
      path:'/' + baseName + '/{id}',
      handler: function (request, reply) {
          var fileName = fs.readdirSync(basePath)[encodeURIComponent(request.params.id)]
          return reply(fs.readFileSync(basePath + fileName, 'utf8'))
      }
  })

  server.route({
      method: 'DELETE',
      path:'/' + baseName + '/{id}',
      handler: function (request, reply) {
          var fileName = fs.readdirSync(basePath)[encodeURIComponent(request.params.id)]
          fs.unlink(basePath + fileName)
          return reply("{}")
      }
  })

  server.route({
      method: 'POST',
      path:'/' + baseName,
      handler: function (request, reply) {
          var fileName = new Date().toISOString()
          var file = basePath + fileName + '.json'
          jsonfile.writeFile(file, request.payload, err => {
            if (err) { console.error(err) }
          })
          reply()
      }
  })

}
