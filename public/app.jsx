var App = React.createClass({
    getInitialState: function () {
        return {
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
        this.socket.on('messageChange', function (messages) {
            that.setState({ messages: messages });
        });
        this.socket.emit('fetch');
    },
    sendMessage: function (message, callback) {
        this.socket.emit('newMessage', message, function (err) {
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
            <div className="app">
                <Board board={this.state.board} reset={this.reset} makeMove={this.makeMove}/>
            </div>
        );

        // <ChatSection messages={this.state.messages} sendMessage={this.sendMessage}/>
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
                for(var column=0; column<7; column++) {
                    board.unshift(<Hole clicked={oc(column)} colour={this.props.board[row][column]}/>);
                }
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
            <div onClick={this.handleClick} className="hole"><div className={this.props.colour}></div></div>
        );
    }
});

// var ChatSection = React.createClass({
//     render: function () {
//         return (<div className="chatsection">
//             <h3>Connect 4:</h3>
//             <Board board={this.props.board} makeMove={this.makeMove}/>
//             <ChatSection sendMessage={this.sendMessage}/>
//         </div>);
//     }
// });


// var MessageList = React.createClass({
//     render: function () {
//         var Comments = (<div>Loading comments...</div>);
//         if (this.props.comments) {
//             Comments = this.props.comments.map(function (comment) {
//                 return (<Comment comment={comment} />);
//             });
//         }
//         return (
//             <div className="commentList">
//                 {Comments}
//             </div>
//         );
//     }
// });


// var Comment = React.createClass({
//     render: function () {
//         return (
//             <div className="comment">
//                 <span className="author">{this.props.comment.author}</span> said:<br/>
//                 <div className="body">{this.props.comment.text}</div>
//             </div>
//         );
//     }
// });
// var CommentForm = React.createClass({
//     handleSubmit: function (e) {
//         e.preventDefault();
//         var that = this;
//         var author = this.refs.author.getDOMNode().value;
//         var text = this.refs.text.getDOMNode().value;
//         var comment = { author: author, text: text };
//         var submitButton = this.refs.submitButton.getDOMNode();
//         submitButton.innerHTML = 'Posting comment...';
//         submitButton.setAttribute('disabled', 'disabled');
//         this.props.submitComment(comment, function (err) {
//             that.refs.author.getDOMNode().value = '';
//             that.refs.text.getDOMNode().value = '';
//             submitButton.innerHTML = 'Post comment';
//             submitButton.removeAttribute('disabled');
//         });
//     },
//     render: function () {
//         return (
//             <form className="commentForm" onSubmit={this.handleSubmit}>
//                 <input type="text" name="author" ref="author" placeholder="Name" required /><br/>
//                 <textarea name="text" ref="text" placeholder="Comment" required></textarea><br/>
//                 <button type="submit" ref="submitButton">Post comment</button>
//             </form>
//         );
//     }
// });

React.render(
    <App/>,
    document.getElementById('content')
);