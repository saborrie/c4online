var GameController = require('gamecontroller');
var findingPublicGame = require('semaphore')(1);
var waitingSocket = null;
var privateGames = {};
var passwordPrivateGames = {};

function UserController(socket) {
    this.socket = socket;

    socket.on('joinPublicGame', function() {
        findingPublicGame.take(function() {
            if(waitingSocket !== null) {
                GameController([waitingSocket, socket], true);
                waitingSocket = null;
            } else {
                waitingSocket = socket;
            }
            findingPublicGame.leave();
        });
        socket.emit('lookingForGame');
    });

    socket.on('createPrivateGame', function() {
        privateGames[socket.username] = socket;
        socket.broadcast.emit('privateGames', Object.keys(privateGames));
    });

    socket.on('createPasswordPrivateGame', function(credentials) {
        passwordPrivateGames[socket.username] = {
            name: credentials.name,
            password: credentials.password,
            socket: socket
        };
    });

    socket.on('joinPrivateGame', function(username) {
        if(privateGames.hasOwnProperty(username)) {
            GameController([socket, privateGames[username]], false);
            delete privateGames[username];
        }
    });

    socket.on('joinPasswordPrivateGame', function(credentials) {
        if(passwordPrivateGames.hasOwnProperty(credentials.name) && passwordPrivateGames[credentials.name].password == credentials.password) {
            GameController([socket, passwordPrivateGames[name].socket], false);
            delete passwordPrivateGames[credentials.name];
        }
    });

    socket.on('disconnect', function() {
        findingPublicGame.take(function() {
            if(waitingSocket == socket) {
                waitingSocket = null;
            }
            findingPublicGame.leave();
        });
        if(privateGames.hasOwnProperty(socket.username)) {
            delete privateGames[socket.username];
            socket.broadcast.emit('privateGames', Object.keys(privateGames));
        }
    });

    socket.emit('privateGames', Object.keys(privateGames));
}

module.exports = UserController;