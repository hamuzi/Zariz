import React from 'react';
import ReactDOM from 'react-dom';

import Button from '../Button/Button';
import './Modal.css';

const modal = props => {
  if (!props.show) {
    return null;
  }

  return ReactDOM.createPortal(
    <React.Fragment>
      <div className="modal__backdrop" onClick={props.onCancelModal} />
      <div className="modal">
        <div className="modal__header">
          <h2>{props.title}</h2>
          <Button mode="flat" onClick={props.onCancelModal}>
            Close
          </Button>
        </div>
        <div className="modal__content">{props.children}</div>
      </div>
    </React.Fragment>,
    document.body
  );
};

export default modal;
