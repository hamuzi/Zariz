import React from 'react';
import { NavLink } from 'react-router-dom';

import Button from '../../Button/Button';
import './NavigationItems.css';

// Translates auth state into a small and readable navigation config for desktop and mobile menus.
const buildItems = props => {
  if (!props.isAuth) {
    return [
      { to: '/', label: 'Login' },
      { to: '/signup', label: 'Signup' }
    ];
  }

  return [
    {
      to: '/',
      label: props.role === 'BUSINESS' ? 'Business Board' : 'Driver Board'
    }
  ];
};

const navigationItems = props => {
  const items = buildItems(props);
  const classes = ['navigation-items', props.mobile ? 'navigation-items--mobile' : ''];

  return (
    <ul className={classes.join(' ').trim()}>
      {items.map(item => (
        <li key={item.label} onClick={props.onChooseItem}>
          <NavLink exact to={item.to} activeClassName="navigation-items__active">
            {item.label}
          </NavLink>
        </li>
      ))}
      {props.isAuth && (
        <li>
          <Button
            mode="flat"
            onClick={() => {
              props.onLogout();
              if (props.onChooseItem) {
                props.onChooseItem();
              }
            }}
          >
            Logout
          </Button>
        </li>
      )}
    </ul>
  );
};

export default navigationItems;
