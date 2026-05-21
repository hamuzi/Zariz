import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Auth from './Auth';
import Input from '../../components/Form/Input/Input';
import Button from '../../components/Button/Button';
import { email, length, required } from '../../util/validators';

class Login extends Component {
  state = {
    email: {
      value: '',
      valid: false,
      touched: false,
      validators: [required, email]
    },
    password: {
      value: '',
      valid: false,
      touched: false,
      validators: [required, length({ min: 8 })]
    }
  };

  // Keeps the form local to the login page and validates each field as the user types.
  inputChangeHandler = (input, value) => {
    this.setState(prevState => ({
      [input]: {
        ...prevState[input],
        value: value,
        valid: prevState[input].validators.every(validator => validator(value)),
        touched: true
      }
    }));
  };

  // Builds the payload expected by the auth-service and hands it off to App.js.
  submitHandler = event => {
    this.props.onLogin(event, {
      email: this.state.email.value,
      password: this.state.password.value
    });
  };

  render() {
    return (
      <Auth>
        <div className="auth-form__header">
          <h1>Login to Zariz</h1>
          <p>Business users manage orders. Drivers claim and progress them.</p>
        </div>
        <form className="auth-form__body" onSubmit={this.submitHandler}>
          <Input
            id="email"
            label="Email"
            control="input"
            type="email"
            value={this.state.email.value}
            valid={this.state.email.valid}
            touched={this.state.email.touched}
            onChange={this.inputChangeHandler}
          />
          <Input
            id="password"
            label="Password"
            control="input"
            type="password"
            value={this.state.password.value}
            valid={this.state.password.valid}
            touched={this.state.password.touched}
            onChange={this.inputChangeHandler}
          />
          <div className="auth-form__actions">
            <Link className="auth-form__switch" to="/signup">
              Need an account?
            </Link>
            <Button type="submit" disabled={this.props.loading}>
              {this.props.loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </form>
      </Auth>
    );
  }
}

export default Login;
