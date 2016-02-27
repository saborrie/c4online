var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');

app.set('port', (process.env.PORT || 5000));

app.use('/', express.static(path.join(__dirname, 'public')));

app.listen(app.get('port'), function() {
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

// var sendComments = function (socket) {
//     fs.readFile('_comments.json', 'utf8', function(err, comments) {
//         comments = JSON.parse(comments);
//         socket.emit('comments', comments);
//     });
// };

var sendBoard = function (socket) {
    io.emit('board', board);
    // socket.broadcast.emit('board', board);
};

io.on('connection', function (socket) {
    console.log('New client connected!');

    user = {
        id: usercounter++,
        socket: socket
    };
    users.push(user);

    
    socket.on('fetch', function () {
        sendBoard(socket);
    });
  
    socket.on('newMove', function (move, callback) {

        for(var row=0; row<6; row++) {
            if(board[row][move.column] == "E") {
                board[row][move.column] = turn;
                sendBoard(socket);
                turn = turn=="red" ? "yellow" : "red";
                break;
            }
        }
    });

    socket.on('disconnect', function(){
        users.pop(user);
    });

    // socket.on('fetchComments', function () {
    //     sendComments(socket);
    // });

    // socket.on('newComment', function (comment, callback) {
    //     fs.readFile('_comments.json', 'utf8', function(err, comments) {
    //         comments = JSON.parse(comments);
    //         comments.push(comment);
    //         fs.writeFile('_comments.json', JSON.stringify(comments, null, 4), function (err) {
    //             io.emit('comments', comments);
    //             callback(err);
    //         });
    //     });
    // });
});