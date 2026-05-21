import React from 'react';

import MobileToggle from '../MobileToggle/MobileToggle';
import NavigationItems from '../NavigationItems/NavigationItems';
import './MainNavigation.css';

const mainNavigation = props => (
  <nav className="main-navigation">
    <div className="main-navigation__brand">
      <button
        className="main-navigation__mobile-button"
        onClick={props.onOpenMobileNav}
      >
        <MobileToggle />
      </button>
      <div>
        <p>Zariz</p>
        <span>Delivery workspace</span>
      </div>
    </div>
    <div className="main-navigation__items">
      <NavigationItems
        isAuth={props.isAuth}
        role={props.role}
        onLogout={props.onLogout}
      />
    </div>
  </nav>
);

export default mainNavigation;
