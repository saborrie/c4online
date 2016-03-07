var React = require('react');

var Menu = React.createClass({

    propTypes: {
        username: React.PropTypes.string.isRequired,
        privateGames: React.PropTypes.array.isRequired,
        createPrivateGame: React.PropTypes.func.isRequired,
        joinPrivateGame: React.PropTypes.func.isRequired,
        joinPublicGame: React.PropTypes.func.isRequired,
        disconnect: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
        return {
            privateGameDialogOpen: false
        };
    },

    render: function() {
        var that = this;

        var privateGameList = this.props.privateGames.map(function(privateGame) {
            return (
                <tr key={privateGame}>
                    <td>{privateGame}</td>
                    <td>
                        <a className="button" onClick={function() {
                            that.props.joinPrivateGame(privateGame);
                        }}>Join game</a>
                    </td>
                </tr>
            );
        });

        if(!privateGameList.length){
            privateGameList = (
                <tr>
                    <td>No games currently available</td>
                </tr>
            );
        }

        var page = [];

        page.push(
            <div className="row profileinfo">
                <h1>
                    {this.props.username}
                </h1>
                <div>
                    Wins: 0
                    Ties: 0
                    Losses: 0
                </div>
                <a onClick={this.props.disconnect}>Log out</a>
            </div>
        );

        if(this.state.privateGameDialogOpen) {

             page.push(
                <div>
                    <p>password private game form</p>
                    <a onClick={this._closePrivateGameDialog}>cancel</a>
                </div>
            );
        } else {
            page.push(
                <div>
                    <div className="row">
                        <a className="button u-full-width big-button" onClick={this.props.joinPublicGame}>Play a ranked game</a>
                    </div>
                
                    <div className="row">
                        <a className="button u-full-width" onClick={this.props.createPrivateGame}>Host an unranked game</a>
                    </div>

                    <div className="row">
                        <a className="button u-full-width" onClick={this._openHostPrivateGameDialog}>Host a private game</a>
                    </div>

                    <div className="row">
                        <a className="button u-full-width" onClick={this.props._openJoinPrivateGameDialog}>Join a private game</a>
                    </div>
          
                    <table className="u-full-width">
                        <thead>
                            <tr>
                                <th>Available unranked games</th>
                                <th></th>
                            </tr>
                        </thead>

                        <tbody>
                            {privateGameList}
                        </tbody>
                    </table>
                </div>
            );
        }

        return (
            <div>
                {page}
            </div>
        );
    },

    _openHostPrivateGameDialog: function() {
        this.setState({
            privateGameDialogOpen: true,
            joinPrivateGame: false
        });
    },

    _openJoinPrivateGameDialog: function() {
        this.setState({
            privateGameDialogOpen: true,
            joinPrivateGame: true
        });
    },

    _closePrivateGameDialog: function() {
        this.setState({
            privateGameDialogOpen: false
        });
    },

});

module.exports = Menu;