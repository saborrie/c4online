var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var lookingForGame = require('semaphore')(2);
var waitingForOpponent = require('semaphore')(1);

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
    result = 'E';

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

    var sendResult = function () {
        users.forEach(function(user, userNumber) {
            user.socket.emit('result', result);
        });
    };

    var makeMove = function(column) {
        for(var row=0; row<6; row++) {
            if(board[row][column] == "E") {
                board[row][column] = turn;
                turn = turn===0 ? 1 : 0;
                return true;
            }
        }
        return false;
    };

    users.forEach(function(user, userNumber) {
        users[userNumber].socket.emit("game", {
            opponent: users[1-userNumber].nickname,
            turncolour: turn,
            turntime: timer
        });

        users[userNumber].socket.emit('id', userNumber);

        users[userNumber].socket.on('newMove', function (move) {

            if(turn == userNumber) {
                if(makeMove(move.column)) {
                    timer=30;
                    sendBoard();
                    result = checkBoardState(board);
                    if(result != 'E') {
                        sendResult();    
                    }
                }    
            }
            
        });

        users[userNumber].socket.on('newMessage', function (text) {
            sendingMessage.take(function() {
                messages.push({ author: userNumber, text: text });
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

        if(timer===0){
            for(var column=0; column<7; column++) {
                if(makeMove(column)) {
                    timer=30;
                    sendBoard();
                    result = checkBoardState(board);
                    if(result != 'E') {
                        sendResult();    
                    }
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

        if(user.nickname) return;
        user.nickname = nickname;
        
        lookingForGame.take(function() {
            waitingForOpponent.take(function() {
                getWaiting(function(waiting) {
                    if(waiting !== null && waiting != user) {
                        createGame(user, waiting);
                        setWaiting(null, function(){
                            waitingForOpponent.leave();
                        });
                    } else {
                        setWaiting(user, function(){
                            waitingForOpponent.leave();
                        });
                    }
                });

                lookingForGame.leave();
            });
        });
    });
});

function checkBoardState(b) {
    if(-1 != b[5].indexOf('E')) return 'D';
    for(var r=0; r<6; r++) {
        for(var c=0; c<7; c++) {
            if(c<4 &&           b[r][c] ==  b[r][c+1] ==    b[r][c+2] ==    b[r][c+3])      return b[r][c];
            if(r<3 &&           b[r][c] ==  b[r+1][c] ==    b[r+2][c] ==    b[r+3][c])      return b[r][c];
            if(c<4 && r<3 &&    b[r][c] ==  b[r+1][c+1] ==  b[r+1][c+2] ==  b[r+1][c+3])    return b[r][c];
            if(c<4 && r>2 &&    b[r][c] ==  b[r-1][c+1] ==  b[r-1][c+2] ==  b[r-1][c+3])    return b[r][c];
        }
    }
    return 'E';
}