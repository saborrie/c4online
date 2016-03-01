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

var SignUpForm = React.createClass({
    handleSubmit: function (e) {
        e.preventDefault();
        var that = this;
        var nickname = this.refs.nickname.getDOMNode().value;
        this.props.setNickname(nickname);
    },
    render: function () {
        return (
            <div className={classNames("container", "section")}>
                <h3 className="section-heading">Connect 4 online</h3>
                <p className="section-description">Play connect 4 against other people over the internet.</p>
                <form onSubmit={this.handleSubmit}>
                    <input ref="nickname" type="text" placeholder="Pick a nickname" required />
                    <input type="submit" className={classNames("button", "button-primary")} value="Start playing" />  
                </form>
            </div>
        );
    }
});

var App = React.createClass({
    getInitialState: function () {
        return {
            id: null,
            board: null,
            messages: [],
            game: false,
            nickname: null
        };
    },
    componentDidMount: function () {
        var that = this;
        this.socket = io();
        that.setState({game: false});
        this.socket.on('game', function (game) {
            that.setState({
                game: true,
                opponent: game.opponent,
                turntime: game.turntime,
                turncolour: game.turncolour
            });

            that.socket.on('board', function (board) {
                that.setState({ 
                    board: board.map(function(row) {
                        return row.map(function(cell) {
                            switch(cell) {
                                case that.state.id:
                                    return "yellow";
                                case 1-that.state.id:
                                    return "red"
                                default:
                                    return null;
                            }
                        });
                    })
                });
            });
            that.socket.on('id', function (id) {
                that.setState({ id: id });
            });
            that.socket.on('turn', function (game) {
                that.setState({
                    turntime: game.turntime,
                    turncolour: game.turncolour
                });
            });
            that.socket.on('messages', function (messages) {
                that.setState({ 
                    messages: messages.map(function(message) {
                        message.colour = message.author==that.state.id ? "sent" : "received";
                        return message;
                    })
                });
            });
        });
    },
    setNickname: function(nickname) {
        this.socket.emit('setNickname', nickname);
        this.setState({nickname: nickname});
    },
    sendMessage: function (text, callback) {
        this.socket.emit('newMessage', text);
    },
    reset: function() {
        this.socket.emit('reset');
    },
    makeMove: function (column, callback) {
        this.socket.emit('newMove', {column: column});
    },
    render: function() {
        if(!this.state.nickname) {
            return (
                <SignUpForm setNickname={this.setNickname} />
            );
        } else if(this.state.game) {
            turn = "unknown turn";

            switch(this.state.turncolour) {
                case this.state.id:
                    turn = "It is your turn (" + this.state.turntime + ")";
                    break;
                case 1-this.state.id:
                    turn = "It is " + this.state.opponent + "'s' turn (" + this.state.turntime + ")";
                    break;
            }


            return (
                <div className="content">
                <div className="main">
                    <div className="container">
                        <div className={classNames("board-wrapper", "row")}>
                            <div>{this.state.nickname} vs {this.state.opponent}</div>
                            <Board board={this.state.board} makeMove={this.makeMove}/>
                            <div>{turn}</div>
                        </div>
                        <MessageList messages={this.state.messages} />
                    </div>
                </div>
                <div className="footer">
                    <ChatForm sendMessage={this.sendMessage}/>
                </div>
                </div>
            );
        } else {
            return (<div className="splash">Looking for a game</div>);
        }

        

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
        this.props.sendMessage(text);
        that.refs.text.getDOMNode().value = '';
    },
    render: function () {
        return (
            <form className="container" onSubmit={this.handleSubmit}>
                <input type="text" required ref="text"  className="messagebox" placeholder="Type a message..." />
            </form>
        );
    }
});

React.render(
    <App/>,
    document.getElementById('content')
);