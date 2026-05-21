import React from 'react';

import './Input.css';

const input = props => {
  const classes = [
    'input__control',
    !props.valid && props.touched ? 'input__control--invalid' : ''
  ]
    .join(' ')
    .trim();

  return (
    <div className="input">
      {props.label && <label htmlFor={props.id}>{props.label}</label>}
      {props.control === 'input' && (
        <input
          className={classes}
          type={props.type || 'text'}
          id={props.id}
          required={props.required}
          value={props.value}
          placeholder={props.placeholder}
          onChange={event => props.onChange(props.id, event.target.value)}
          onBlur={props.onBlur}
        />
      )}
      {props.control === 'textarea' && (
        <textarea
          className={classes}
          id={props.id}
          rows={props.rows}
          required={props.required}
          value={props.value}
          placeholder={props.placeholder}
          onChange={event => props.onChange(props.id, event.target.value)}
          onBlur={props.onBlur}
        />
      )}
      {props.control === 'select' && (
        <select
          className={classes}
          id={props.id}
          value={props.value}
          onChange={event => props.onChange(props.id, event.target.value)}
        >
          {props.options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
      {props.helpText && <small className="input__help">{props.helpText}</small>}
    </div>
  );
};

export default input;
