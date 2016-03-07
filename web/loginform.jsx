var React = require('react');

var LoginForm = React.createClass({

    propTypes: {
        authenticate: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
        return {
            username: '',
            password: ''
        };
    },

    render: function() {
        return (
            <form onSubmit={this._onSubmit}>
                <div className="row">
                    <h1>Log in</h1>
                </div>
                <div className="row">
                    <label>Username</label>
                    <input
                        className="u-full-width"
                        type='text'
                        ref='username'
                        placeholder='username'
                        value={this.state.username}
                        onChange={this._onUsernameChange}
                    />
                </div>  
                <div className="row">
                    <label>Password</label>
                    <input
                        className="u-full-width"
                        type='password'
                        ref='password'
                        placeholder='password'
                        value={this.state.password}
                        onChange={this._onPasswordChange}
                    />
                </div>

                <button className="button-primary" type="submit">Log in</button>
            </form>
        );
    },

    _onUsernameChange: function(event, value) {
        this.setState({username: event.target.value});
    },

    _onPasswordChange: function(event, value) {
        this.setState({password: event.target.value});
    },

    _onSubmit: function(event) {
        event.preventDefault();
        var user = {
            username: this.state.username,
            password: this.state.password
        }

        this.props.authenticate(user);
    }

});

module.exports = LoginForm;