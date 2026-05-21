import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Auth from './Auth';
import Input from '../../components/Form/Input/Input';
import Button from '../../components/Button/Button';
import { email, length, required } from '../../util/validators';

class Signup extends Component {
  state = {
    name: {
      value: '',
      valid: false,
      touched: false,
      validators: [required, length({ min: 2, max: 100 })]
    },
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
    },
    role: {
      value: 'BUSINESS',
      valid: true,
      touched: false,
      validators: [required]
    }
  };

  // Keeps signup validation consistent with the backend rules before any request is sent.
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

  // Sends the signup payload upward so the root app can handle loading and global error state.
  submitHandler = event => {
    this.props
      .onSignup(event, {
        name: this.state.name.value,
        email: this.state.email.value,
        password: this.state.password.value,
        role: this.state.role.value
      })
      .then(wasSuccessful => {
        if (wasSuccessful) {
          this.props.history.replace('/');
        }
      });
  };

  render() {
    return (
      <Auth>
        <div className="auth-form__header">
          <h1>Create account</h1>
          <p>Choose the role now so the app can route you into the right dashboard.</p>
        </div>
        <form className="auth-form__body" onSubmit={this.submitHandler}>
          <Input
            id="name"
            label="Full name"
            control="input"
            value={this.state.name.value}
            valid={this.state.name.valid}
            touched={this.state.name.touched}
            onChange={this.inputChangeHandler}
          />
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
          <Input
            id="role"
            label="Role"
            control="select"
            value={this.state.role.value}
            valid={this.state.role.valid}
            touched={this.state.role.touched}
            onChange={this.inputChangeHandler}
            options={[
              { value: 'BUSINESS', label: 'Business' },
              { value: 'DRIVER', label: 'Driver' }
            ]}
          />
          <div className="auth-form__actions">
            <Link className="auth-form__switch" to="/">
              Back to login
            </Link>
            <Button type="submit" disabled={this.props.loading}>
              {this.props.loading ? 'Creating...' : 'Create account'}
            </Button>
          </div>
        </form>
      </Auth>
    );
  }
}

export default Signup;
