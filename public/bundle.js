(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
  Copyright (c) 2016 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg)) {
				classes.push(classNames.apply(null, arg));
			} else if (argType === 'object') {
				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = classNames;
	} else if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
		// register as 'classnames', consistent with npm package name
		define('classnames', [], function () {
			return classNames;
		});
	} else {
		window.classNames = classNames;
	}
}());

},{}],2:[function(require,module,exports){
var classNames = require('classnames');

var MessageList = React.createClass({displayName: "MessageList",
    render: function () {
        var messages = (React.createElement("div", null, "Loading messages..."));
        if (this.props.messages) {
            messages = this.props.messages.map(function (message) {
                return (React.createElement(Message, {message: message}));
            });
        }
        return (
            React.createElement("div", {className: "messagelist"}, 
                messages.reverse()
            )
        );
    }
});

var App = React.createClass({displayName: "App",
    getInitialState: function () {
        return {
            id: null,
            board: null,
            messages: []
        };
    },
    componentDidMount: function () {
        var that = this;
        this.socket = io();
        this.socket.on('board', function (board) {
            that.setState({ board: board });
        });
        this.socket.on('id', function (id) {
            that.setState({ id: id });
        });
        this.socket.on('newmessages', function() {
            that.socket.emit('fetchmessages');
        });
        this.socket.on('messages', function (messages) {
            that.setState({ messages: messages });
        });
        this.socket.emit('fetch');
    },
    sendMessage: function (text, callback) {
        this.socket.emit('newMessage', text, function (err) {
            if (err)
                return console.error('New message error:', err);
            callback();
        });
    },
    reset: function() {
        this.socket.emit('reset');
    },
    makeMove: function (column, callback) {
        this.socket.emit('newMove', {column: column}, function (err) {
            if (err)
                return console.error('New move error:', err);
            callback();
        });
    },
    render: function() {
        return (
            React.createElement("div", {className: "content"}, 
            React.createElement("div", {className: "main"}, 
                React.createElement("div", {className: "container"}, 
                    React.createElement("div", {className: classNames("board-wrapper", "row")}, 
                        React.createElement(Board, {board: this.state.board, reset: this.reset, makeMove: this.makeMove})
                    ), 
                    React.createElement(MessageList, {messages: this.state.messages})
                )
            ), 
            React.createElement("div", {className: "footer"}, 
                React.createElement(ChatForm, {sendMessage: this.sendMessage})
            )
            )
        );

    }
});


var Board = React.createClass({displayName: "Board",
    reset: function() {
        this.props.reset();
    },
    render: function () {
        var board = (React.createElement("div", null, "Loading board..."));
        var that = this;

        if(this.props.board) {

            board = [];

            oc = function(c){ return function() { that.props.makeMove(c); }; };

            for(var row=0; row<6; row++) {
                var line = [];

                for(var column=0; column<7; column++) {
                    line.push(React.createElement(Hole, {clicked: oc(column), colour: this.props.board[row][column]}));
                }

                board.unshift(
                    React.createElement("div", {className: "row"}, line)
                );
            }
        }

        return (
            React.createElement("div", {className: "board"}, 
                board, 
                React.createElement("a", {onClick: this.reset}, "reset")
            )
        );
    }
});

var Hole = React.createClass({displayName: "Hole",
    handleClick: function () {
        this.props.clicked();
    },
    render: function () {
        return (
            React.createElement("div", {onClick: this.handleClick, className: classNames("cell", this.props.colour)})
        );
    }
});





var Message = React.createClass({displayName: "Message",
    render: function () {
        return (
            React.createElement("div", {className: classNames("message", this.props.message.colour)}, this.props.message.text)
        );
    }
});


var ChatForm = React.createClass({displayName: "ChatForm",
    handleSubmit: function (e) {
        e.preventDefault();
        var that = this;
        var text = this.refs.text.getDOMNode().value;
        this.props.sendMessage(text, function (err) {
            that.refs.text.getDOMNode().value = '';
        });
    },
    render: function () {
        return (
            React.createElement("form", {className: "container", onSubmit: this.handleSubmit}, 
                React.createElement("input", {type: "text", required: true, ref: "text", className: "messagebox", placeholder: "Type a message...  (set to h-texth / 2)"})
            )
        );
    }
});

React.render(
    React.createElement(App, null),
    document.getElementById('content')
);

},{"classnames":1}]},{},[2]);
