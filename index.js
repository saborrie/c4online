var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');

app.set('port', (process.env.PORT || 5000));

app.use('/', express.static(path.join(__dirname, 'public')));

var server = app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

// Socket.IO part
var io = require('socket.io')(server);

board = [];
for(var i=0; i<6; i++) {
    board[i] = [];
    for(var j=0; j<7; j++) {
        board[i][j] = "E";
    }
}

var users = [];
var usercounter = 0;
turn = "red";

var sendMessages = function (socket) {
    fs.readFile('_messages.json', 'utf8', function(err, messages) {
        messages = JSON.parse(messages);
        messages = messages.map(function(message) {
            message.colour = message.author == user.id ? "sent" : "received";
            return message;
        });
        user.socket.emit('messages', messages);
    });
};

var sendBoard = function (user) {
    io.emit('board', board);
};

var sendId = function (user) {
    user.socket.emit('id', user.id);
};

io.on('connection', function (socket) {
    console.log('New client connected!');

    user = {
        id: usercounter++,
        socket: socket
    };

    sendId(user);
    sendBoard(user);
    sendMessages(user);

    user.socket.on('fetch', function () {
        sendId(user);
        sendBoard(user);
        sendMessages(user);
    });

    user.socket.on('fetchmessages', function () {
        sendMessages(user);
    });

    socket.on('reset', function () {
        board = [];
        for(var i=0; i<6; i++) {
            board[i] = [];
            for(var j=0; j<7; j++) {
                board[i][j] = "E";
            }
        }
        sendBoard(socket);
    });
  
    user.socket.on('newMove', function (move, callback) {

        for(var row=0; row<6; row++) {
            if(board[row][move.column] == "E") {
                board[row][move.column] = turn;
                sendBoard(socket);
                turn = turn=="red" ? "yellow" : "red";
                break;
            }
        }
    });

    user.socket.on('disconnect', function(){
        users.pop(user);
    });

    user.socket.on('newMessage', function (text, callback) {
        fs.readFile('_messages.json', 'utf8', function(err, messages) {
            messages = JSON.parse(messages);
            messages.push({ author: user.id, text: text });
            //messages = messages.slice(-10);
            fs.writeFile('_messages.json', JSON.stringify(messages, null, 4), function (err) {
                io.emit('newmessages');
                callback(err);
            });
        });
    });
});