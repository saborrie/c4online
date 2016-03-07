var Datastore = require('nedb');
var db = {};
db.users = new Datastore({ filename: 'datastores/users.datastore', autoload: true });

module.exports = {

    authenticateUser: function(user, callback){
        db.users.find({username: user.username}, function(err, docs) {
            if(err) {
                callback(err);
                return;
            }

            if(docs.length == 1 && docs[0].password == user.password) {
                callback(null);
            } else {
                callback('Invalid credentials');    
            }
        });
    },

    registerUser: function(user, callback) {
        db.users.count({username: user.username}, function(err, count) {
            if(count < 1) {
                db.users.insert({
                    username: user.username,
                    password: user.password,
                    wins: 0,
                    ties: 0,
                    losses: 0
                }, function(err, newDoc) {
                    callback(err);
                });
            } else {
                callback(new Error('Username already taken.'));
            }
        });
    }

};