var classNames = require('classnames');

var MessageList = React.createClass({
    render: function () {
        var messages = (<div>Loading messages...</div>);
        if (this.props.messages) {
            messages = this.props.messages.map(function (message) {
                return (<Message message={message} />);
            });
        }
        return (
            <div className="messagelist">
                {messages.reverse()}
            </div>
        );
    }
});

var App = React.createClass({
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
            <div className="content">
            <div className="main">
                <div className="container">
                    <div className={classNames("board-wrapper", "row")}>
                        <Board board={this.state.board} reset={this.reset} makeMove={this.makeMove}/>
                    </div>
                    <MessageList messages={this.state.messages} />
                </div>
            </div>
            <div className="footer">
                <ChatForm sendMessage={this.sendMessage}/>
            </div>
            </div>
        );

    }
});


var Board = React.createClass({
    reset: function() {
        this.props.reset();
    },
    render: function () {
        var board = (<div>Loading board...</div>);
        var that = this;

        if(this.props.board) {

            board = [];

            oc = function(c){ return function() { that.props.makeMove(c); }; };

            for(var row=0; row<6; row++) {
                var line = [];

                for(var column=0; column<7; column++) {
                    line.push(<Hole clicked={oc(column)} colour={this.props.board[row][column]}/>);
                }

                board.unshift(
                    <div className="row">{line}</div>
                );
            }
        }

        return (
            <div className="board">
                {board}
                <a onClick={this.reset}>reset</a>
            </div>
        );
    }
});

var Hole = React.createClass({
    handleClick: function () {
        this.props.clicked();
    },
    render: function () {
        return (
            <div onClick={this.handleClick} className={classNames("cell", this.props.colour)}></div>
        );
    }
});





var Message = React.createClass({
    render: function () {
        return (
            <div className={classNames("message", this.props.message.colour)}>{this.props.message.text}</div>
        );
    }
});


var ChatForm = React.createClass({
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
            <form className="container" onSubmit={this.handleSubmit}>
                <input type="text" required ref="text"  className="messagebox" placeholder="Type a message...  (set to h-texth / 2)" />
            </form>
        );
    }
});

React.render(
    <App/>,
    document.getElementById('content')
);