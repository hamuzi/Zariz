import React from 'react';

import Modal from '../Modal/Modal';

const errorHandler = props => (
  <Modal
    show={!!props.error}
    title="Something went wrong"
    onCancelModal={props.onHandle}
  >
    <p>{props.error ? props.error.message : null}</p>
  </Modal>
);

export default errorHandler;
