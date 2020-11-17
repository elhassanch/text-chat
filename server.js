var static = require('node-static');
var http = require('http');
var i=0;

var allCLients=[];

var file = new(static.Server)();

var app = http.createServer(function (req, res) {
    file.serve(req, res);
}).listen(process.env.PORT || 8181);

// Solve CORS ISSUES =================================================================
var io = require("socket.io")(app, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["Access-Control-Allow-Origin "],
      credentials: true
    }
});

io.sockets.on('connection', function (socket){

    // Store ClientsID + Username ======================
    socket.on('clientsID', function (username) {
        allCLients[socket.id]=username;
    });

    // Create/Join the room ======================
    socket.on('create or join', function (channel) {
        var numClients = io.sockets.adapter.rooms[channel]!=undefined ? Object.keys(io.sockets.adapter.rooms[channel]).length:i;
        i=i+1;
        console.log('numclients = ' + numClients);
        
        if (numClients == 0){

            socket.join(channel);
            socket.emit('created', channel);
        } else if (numClients < 100) {
            io.sockets.in(channel).emit('remotePeerJoining',
            channel);
            socket.join(channel);

            socket.broadcast.to(channel).emit
            ('broadcast: joined', 'The user  ' + allCLients[socket.id] + ' joined channel ' + channel);
        } else { 
            console.log("Channel full!");
            socket.emit('full', channel);
        }
    });
    
    socket.on('message', function (message) {
        log('S --> Got message: ', message);
        socket.broadcast.to(message.channel).emit('message',  message.message);
    });
    
    socket.on('response', function (response) {
        log('S --> Got response: ', response);
        socket.broadcast.to(response.channel).emit('response',
        response.message);
    });

    socket.on('Bye', function(channel){
        socket.broadcast.to(channel).emit('Bye');
        socket.disconnect();
    });

    socket.on('Ack', function () {
        console.log('Got an Ack!');
        socket.disconnect();
    });

    function log(){
        var array = [">>> "];
        for (var i = 0; i < arguments.length; i++) {
            array.push(arguments[i]);
        }
        socket.emit('log', array);
    }
});


