var React = require('react');
var io = require('socket.io-client');
var LoginForm = require('./loginform.jsx');
var RegisterForm = require('./registerform.jsx');
var Game = require('./game.jsx');
var Menu = require('./menu.jsx');
var Ajax = require('simple-ajax');

var mode = {
    LOGIN_FORM: 0,
    REGISTER_FORM: 1,
    IN_MENU: 2,
    LOOKING_FOR_A_GAME: 3,
    IN_GAME: 4
};

var App = React.createClass({

    getInitialState: function() {
        return {
            mode: mode.LOGIN_FORM
        };
    },

    render: function() {
        switch(this.state.mode) {

            case mode.IN_MENU:
                return (
                    <div className='menupage'>
                        <h5 className='title'>Connect four online</h5>
                        <Menu
                            username={this.state.username}
                            privateGames={this.state.privateGames}
                            createPrivateGame={this._createPrivateGame}
                            joinPublicGame={this._joinPublicGame}
                            joinPrivateGame={this._joinPrivateGame}
                            disconnect={this._disconnect}
                        />
                    </div>
                );

            case mode.LOOKING_FOR_A_GAME:
                return (
                    <p>Looking for a game</p>
                );

            case mode.IN_GAME:
                return (
                    <Game socket={this.state.socket} />
                );

            case mode.LOGIN_FORM:
                return (
                    <div className='menupage'>
                        <h5 className='title'>Connect four online</h5>
                        <LoginForm authenticate={this._authenticate}/>
                        <a onClick={this._showRegisterForm}>Or click here create an account.</a>
                    </div>
                );

            default:
                return (
                    <div className='menupage'>
                        <h5 className='title'>Connect four online</h5>
                        <RegisterForm register={this._register}/>
                        <a onClick={this._showLoginForm}>Already have an account?</a>
                    </div>
                );

        }
    },

    _showLoginForm: function() {
        this.setState({
            mode: mode.LOGIN_FORM
        });
    },

    _showRegisterForm: function() {
        this.setState({
            mode: mode.REGISTER_FORM
        });
    },

    _register: function(user, callback) {
        var that = this;

        var ajax = new Ajax({
            url: '/register',
            method: 'POST',
            data: JSON.stringify(user)
        });

        ajax.on('success', function(event) {
            callback();
            that._authenticate(user);
        });

        ajax.on('error', function(event) {
            callback(new Error(ajax.request.response));
        });

        ajax.send();
    },

    _authenticate: function(user) {
        var that = this;
        var socket = io();
        socket.on('connect', function(){
            socket.emit('authentication', user);
            socket.on('authenticated', function() {
                that.setState({
                    username: user.username,
                    mode: mode.IN_MENU,
                    socket: socket,
                    privateGames: []
                });
            });

            socket.on('game', function() {
                console.log('game');
                that.setState({
                    mode: mode.IN_GAME
                });
            });

            socket.on('privateGames', function(privateGames) {
                that.setState({
                    privateGames: privateGames
                });
            });

            socket.on('disconnected', function() {
                that.setState({
                    mode: mode.SIGNED_OUT,
                    socket: null
                });
            });

        });
    },

    _joinPublicGame: function() {
        this.setState({
            mode: mode.LOOKING_FOR_A_GAME
        });
        this.state.socket.emit('joinPublicGame');
    },

    _joinPrivateGame: function(username) {
        this.setState({
            mode: mode.LOOKING_FOR_A_GAME
        });
        this.state.socket.emit('joinPrivateGame', username);
    },

    _createPrivateGame: function() {
        this.setState({
            mode: mode.LOOKING_FOR_A_GAME
        });
        this.state.socket.emit('createPrivateGame');
    },

    _disconnect: function() {
        this.state.socket.disconnect();
        this.setState({
            mode: mode.LOGIN_FORM,
            socket: null
        });
    }

});

module.exports = App;