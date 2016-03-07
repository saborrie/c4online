var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var database = require('./data.js');
var UserController = require('./usercontroller.js');

env = process.env.NODE_ENV || 'development';


/* ExpressJS
-----------------------------------------------------------------------------*/

var app = express();
app.use(bodyParser.json()); // for parsing application/json
app.set('port', (process.env.PORT || 5000));

var forceSsl = function (req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    return next();
 };

if(env === "production") {
    app.use(forceSsl);
}

app.use('/', express.static('public'));

app.post('/register', function(req, res, next) {
    database.registerUser({
        username: req.body.username,
        password: req.body.password
    }, function(err) {
        if(!err) {
            res.sendStatus(200);
        } else {
            console.log(err);
            res.status(500).send(err.message);
        }
    });
});

var server = app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});




/* Socket IO
-----------------------------------------------------------------------------*/

var io = require('socket.io')(server);

require('socketio-auth')(io, {

    authenticate: function (socket, data, callback) {
        var user = {
            username: data.username,
            password: data.password
        };

        database.authenticateUser(user, function(err) {
            if (err) return callback(new Error("Invalid login credentials"));
            return callback(null, true);
        });
    },

    postAuthenticate: function(socket, data) {
        socket.username = data.username;
    }
});

io.on('connection', function(socket) {

    console.log('New client connected.');
    var usercontroller = new UserController(socket);

    socket.on('disconnect', function () {
        console.log('Client disconnected.');
    });

});