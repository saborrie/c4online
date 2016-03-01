var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var lookingForGame = require('semaphore')(2);
var waitingForOpponent = require('semaphore')(2);

app.set('port', (process.env.PORT || 5000));

app.use('/', express.static(path.join(__dirname, 'public')));

var server = app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

// Socket.IO part
var io = require('socket.io')(server);

var waitingUser = null;

var getWaiting = function(callback) {
    callback(waitingUser);
};

var setWaiting = function(user, callback) {
    waitingUser = user;
    callback();
};

var usercounter = 0;
turn = "red";

var createGame = function(user1, user2) {
    var sendingMessage = require('semaphore')(1);

    users = [user1, user2];
    turn = 0;
    timer = 30;

    board = [];
    for(var i=0; i<6; i++) {
        board[i] = [];
        for(var j=0; j<7; j++) {
            board[i][j] = "E";
        }
    }

    messages = [];

    var sendMessages = function () {
        users.forEach(function(user, userNumber) {
            user.socket.emit('messages', messages);
        });
    };

    var sendBoard = function () {
        users.forEach(function(user, userNumber) {
            user.socket.emit('board', board);
        });
    };

    users.forEach(function(user, userNumber) {
        users[userNumber].socket.emit("game", {
            opponent: users[1-userNumber].nickname,
            turncolour: turn,
            turntime: timer
        });

        users[userNumber].socket.emit('id', userNumber);

        users[userNumber].socket.on('newMove', function (move) {

            console.log("newmove", userNumber, turn);

            if(turn !== userNumber) return;

            timer=30;

            for(var row=0; row<6; row++) {
                if(board[row][move.column] == "E") {
                    board[row][move.column] = userNumber;
                    console.log('sendBoard');
                    console.log(board);
                    sendBoard();
                    turn = turn===0 ? 1 : 0;
                    break;
                }
            }
        });

        users[userNumber].socket.on('newMessage', function (text) {
            console.log("user" + userNumber + " waiting to send message: " + text);
            sendingMessage.take(function() {
                messages.push({ author: userNumber, text: text });
                console.log("user" + userNumber + " sending message: " + text);
                sendMessages();
                sendingMessage.leave();
            });
        });
    });   

    sendBoard();
    sendMessages();

    setInterval(function() {
        timer = timer-1;
        oldturn = turn;
        if(timer==0){
            for(var column=0; column<7; column++) {
                for(var row=0; row<6; row++) {
                    if(board[row][column] == "E") {
                        board[row][column] = turn;
                        console.log('sendBoard');
                        console.log(board);
                        sendBoard();
                        turn = turn===0 ? 1 : 0;
                        timer = 30;
                        break;
                    }
                }
                if(turn != oldturn) {
                    break;
                }
            }
        }

        users.forEach(function(user, userNumber) {
            users[userNumber].socket.emit('turn', {
                turncolour: turn,
                turntime: timer
            });
        });
        
    }, 1000);
};

io.on('connection', function (socket) {
    console.log('New client connected!');

    user = {
        id: usercounter++,
        socket: socket
    };

    user.socket.on('setNickname', function(nickname) {
        console.log(this);

        if(user.nickname) return;
        user.nickname = nickname;
        console.log("user " + user.nickname + " looking for a game");
        console.log("user " + user.id + " looking for a game");
        
        lookingForGame.take(function() {
            waitingForOpponent.take(function() {
                getWaiting(function(waiting) {
                    if(waiting !== null && waiting != user) {
                        console.log("match made between " + waiting.id + " and " + user.id);
                        createGame(user, waiting);
                        setWaiting(null, function(){
                            waitingForOpponent.leave();
                        });
                    } else {
                        setWaiting(user, function(){
                            console.log("user " + user.id + " hosting and waiting for a match");
                            waitingForOpponent.leave();
                        });
                    }
                });

                lookingForGame.leave();
            });
        });
    });
});