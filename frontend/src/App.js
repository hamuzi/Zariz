import React, { Component, Fragment } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import Layout from './components/Layout/Layout';
import Backdrop from './components/Backdrop/Backdrop';
import Toolbar from './components/Toolbar/Toolbar';
import MainNavigation from './components/Navigation/MainNavigation/MainNavigation';
import MobileNavigation from './components/Navigation/MobileNavigation/MobileNavigation';
import ErrorHandler from './components/ErrorHandler/ErrorHandler';
import LoginPage from './pages/Auth/Login';
import SignupPage from './pages/Auth/Signup';
import BusinessDashboard from './pages/Business/BusinessDashboard';
import DriverDashboard from './pages/Driver/DriverDashboard';
import { login, signup } from './util/api';
import {
  clearSession,
  restoreSession,
  saveSession
} from './util/auth';
import './App.css';

class App extends Component {
  logoutTimer = null;

  state = {
    showBackdrop: false,
    showMobileNav: false,
    isAuth: false,
    token: null,
    userId: null,
    role: null,
    isActive: false,
    authLoading: false,
    error: null
  };

  componentDidMount() {
    // Restores the previous login so the user does not have to authenticate on every refresh.
    const storedSession = restoreSession();
    if (!storedSession) {
      return;
    }

    this.setState({
      isAuth: true,
      token: storedSession.token,
      userId: storedSession.userId,
      role: storedSession.role,
      isActive: storedSession.isActive
    });

    this.setAutoLogout(storedSession.remainingMilliseconds);
  }

  componentWillUnmount() {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
  }

  // Opens and closes the mobile navigation while keeping the backdrop in sync.
  mobileNavHandler = isOpen => {
    this.setState({ showMobileNav: isOpen, showBackdrop: isOpen });
  };

  // Closes temporary UI layers like the mobile menu and any visible error modal.
  backdropClickHandler = () => {
    this.setState({ showBackdrop: false, showMobileNav: false, error: null });
  };

  // Clears both React state and localStorage to fully sign the user out.
  logoutHandler = () => {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }

    clearSession();
    this.setState({
      isAuth: false,
      token: null,
      userId: null,
      role: null,
      isActive: false,
      showBackdrop: false,
      showMobileNav: false
    });
  };

  // Authenticates the user through the auth-service and stores the resulting session.
  loginHandler = (event, authData) => {
    event.preventDefault();
    this.setState({ authLoading: true, error: null });

    login(authData)
      .then(session => {
        const storedSession = saveSession(session);

        this.setState({
          isAuth: true,
          token: storedSession.token,
          userId: storedSession.userId,
          role: storedSession.role,
          isActive: storedSession.isActive,
          authLoading: false
        });

        this.setAutoLogout(storedSession.remainingMilliseconds);
      })
      .catch(error => {
        this.setState({
          isAuth: false,
          authLoading: false,
          error: error
        });
      });
  };

  // Creates a new account and sends the user back to the login page afterwards.
  signupHandler = (event, authData) => {
    event.preventDefault();
    this.setState({ authLoading: true, error: null });

    return signup(authData)
      .then(() => {
        this.setState({ authLoading: false });
        return true;
      })
      .catch(error => {
        this.setState({
          authLoading: false,
          error: error
        });

        return false;
      });
  };

  // Uses the token expiry window to log the user out automatically when the JWT expires.
  setAutoLogout = milliseconds => {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }

    this.logoutTimer = setTimeout(() => {
      this.logoutHandler();
    }, milliseconds);
  };

  // Resets the current error so the modal can disappear cleanly.
  errorHandler = () => {
    this.setState({ error: null });
  };

  render() {
    let routes = (
      <Switch>
        <Route
          path="/"
          exact
          render={props => (
            <LoginPage
              {...props}
              onLogin={this.loginHandler}
              loading={this.state.authLoading}
            />
          )}
        />
        <Route
          path="/signup"
          exact
          render={props => (
            <SignupPage
              {...props}
              onSignup={this.signupHandler}
              loading={this.state.authLoading}
            />
          )}
        />
        <Redirect to="/" />
      </Switch>
    );

    if (this.state.isAuth && this.state.role === 'BUSINESS') {
      routes = (
        <Switch>
          <Route
            path="/"
            exact
            render={() => (
              <BusinessDashboard
                token={this.state.token}
                userId={this.state.userId}
              />
            )}
          />
          <Redirect to="/" />
        </Switch>
      );
    }

    if (this.state.isAuth && this.state.role === 'DRIVER') {
      routes = (
        <Switch>
          <Route
            path="/"
            exact
            render={() => (
              <DriverDashboard
                token={this.state.token}
                userId={this.state.userId}
                isActive={this.state.isActive}
              />
            )}
          />
          <Redirect to="/" />
        </Switch>
      );
    }

    return (
      <Fragment>
        {this.state.showBackdrop && (
          <Backdrop onClick={this.backdropClickHandler} />
        )}
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <Layout
          header={
            <Toolbar>
              <MainNavigation
                onOpenMobileNav={this.mobileNavHandler.bind(this, true)}
                onLogout={this.logoutHandler}
                isAuth={this.state.isAuth}
                role={this.state.role}
              />
            </Toolbar>
          }
          mobileNav={
            <MobileNavigation
              open={this.state.showMobileNav}
              mobile
              isAuth={this.state.isAuth}
              role={this.state.role}
              onChooseItem={this.mobileNavHandler.bind(this, false)}
              onLogout={this.logoutHandler}
            />
          }
        >
          {routes}
        </Layout>
      </Fragment>
    );
  }
}

export default App;
