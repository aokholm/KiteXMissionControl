'use strict';

const Hapi = require('hapi');
const fs = require('fs')
const Inert = require('inert');

const sessionsPath = "./sessions/"

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

server.route({
    method: 'GET',
    path:'/sessions',
    handler: function (request, reply) {
        return reply(JSON.stringify(fs.readdirSync(sessionsPath)))
    }
});

server.route({
    method: 'GET',
    path:'/sessions/{id}',
    handler: function (request, reply) {
        var filename = fs.readdirSync(sessionsPath)[encodeURIComponent(request.params.id)]
        return reply(fs.readFileSync(sessionsPath + filename, 'utf8'))
    }
})

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
})
