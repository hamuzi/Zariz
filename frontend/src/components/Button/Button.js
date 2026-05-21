import React from 'react';

import './Button.css';

const button = props => {
  const classes = ['button', `button--${props.mode || 'raised'}`];

  if (props.design) {
    classes.push(`button--${props.design}`);
  }

  return (
    <button
      className={classes.join(' ')}
      type={props.type || 'button'}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
};

export default button;
