var React = require('react');

var RegisterForm = React.createClass({

    propTypes: {
        register: React.PropTypes.func.isRequired,
    },

    getInitialState: function() {
        return {
            username: '',
            password1: '',
            password2: '',
            errorText: ''
        };
    },

    render: function() {

        var errorText = this.state.errorText;
        if(this.state.password1 != this.state.password2) {
            errorText = "Passwords don't match."
        }

        var disabled = (!this.state.username) || (!this.state.password1) || (this.state.password1 != this.state.password2);

        return (
            <form onSubmit={this._onSubmit}>
                <div className="row">
                    <h1>Register</h1>
                </div>
                <div className="row">
                    <label>Username</label>
                    <input
                        className="u-full-width"
                        type='text'
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
                        placeholder='password'
                        value={this.state.password1}
                        onChange={this._onPassword1Change}
                    />
                </div>

                <div className="row">
                    <label>Confirm Password</label>
                    <input
                        className="u-full-width"
                        type='password'
                        placeholder='confirm password'
                        value={this.state.password2}
                        onChange={this._onPassword2Change}
                    />
                </div>

                <div className="row">
                    <button className="button-primary" type="submit" disabled={disabled}>Register</button>
                    <div className="formError">{errorText}</div>
                </div>
            </form>
        );
    },

    _onUsernameChange: function(event, value) {
        this.setState({username: event.target.value, errorText: ''});
    },

    _onPassword1Change: function(event, value) {
        this.setState({password1: event.target.value, errorText: ''});
    },

    _onPassword2Change: function(event, value) {
        this.setState({password2: event.target.value, errorText: ''});
    },

    _onSubmit: function(event) {
        var that = this;

        event.preventDefault();
        if(this.state.password1 == this.state.password2) {
            var user = {
                username: this.state.username,
                password: this.state.password1
            }

            this.props.register(user, function(err) {
                if(err) {
                    that.setState({
                        errorText: err.message
                    })
                }
            });            
        }
    }

});

module.exports = RegisterForm;