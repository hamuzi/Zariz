import React from 'react';

import NavigationItems from '../NavigationItems/NavigationItems';
import './MobileNavigation.css';

const mobileNavigation = props => {
  const classes = ['mobile-nav', props.open ? 'mobile-nav--open' : ''];

  return (
    <nav className={classes.join(' ').trim()}>
      <NavigationItems
        mobile={props.mobile}
        isAuth={props.isAuth}
        role={props.role}
        onChooseItem={props.onChooseItem}
        onLogout={props.onLogout}
      />
    </nav>
  );
};

export default mobileNavigation;
