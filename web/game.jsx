var React = require('react');

var Game = React.createClass({

    propTypes: {
        socket: React.PropTypes.object.isRequired
    },

    getInitialState: function() {
        return {};
    },

    render: function() {
        return (
            <h1>Game here</h1>
        );
    }

});

module.exports = Game;