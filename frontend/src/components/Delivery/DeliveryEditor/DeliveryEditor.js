import React, { Component } from 'react';

import Modal from '../../Modal/Modal';
import Button from '../../Button/Button';
import Input from '../../Form/Input/Input';
import { buildDeliveryDraft } from '../../../util/delivery';
import './DeliveryEditor.css';

class DeliveryEditor extends Component {
  state = buildDeliveryDraft(this.props.selectedDelivery);

  componentDidUpdate(prevProps) {
    // Rehydrates the form when the user switches between "new" and "edit" inside the same modal.
    if (
      prevProps.selectedDelivery !== this.props.selectedDelivery ||
      prevProps.editing !== this.props.editing
    ) {
      this.setState(buildDeliveryDraft(this.props.selectedDelivery));
    }
  }

  // Updates a single form field and immediately recalculates its validation status.
  inputChangeHandler = (input, value) => {
    this.setState(prevState => {
      const updatedField = {
        ...prevState[input],
        value: value,
        valid: prevState[input].validators.every(validator => validator(value)),
        touched: true
      };

      return {
        ...prevState,
        [input]: updatedField
      };
    });
  };

  // Prevents invalid payloads from reaching the API and forwards clean form data to the parent page.
  submitHandler = event => {
    event.preventDefault();

    if (!this.isFormValid()) {
      this.touchAllFields();
      return;
    }

    this.props.onFinishEdit({
      pickupAddress: this.state.pickupAddress.value,
      dropoffAddress: this.state.dropoffAddress.value,
      customerName: this.state.customerName.value,
      customerPhone: this.state.customerPhone.value,
      price: Number(this.state.price.value || 0),
      notes: this.state.notes.value
    });
  };

  // Marks every field as touched so the user can see exactly what still needs fixing.
  touchAllFields = () => {
    this.setState(prevState => {
      const updatedState = {};

      Object.keys(prevState).forEach(key => {
        updatedState[key] = {
          ...prevState[key],
          touched: true
        };
      });

      return updatedState;
    });
  };

  // Aggregates all field validity checks into one reusable modal-level decision.
  isFormValid = () =>
    Object.keys(this.state).every(key => this.state[key].valid);

  render() {
    return (
      <Modal
        show={this.props.editing}
        title={this.props.selectedDelivery ? 'Edit delivery' : 'New delivery'}
        onCancelModal={this.props.onCancelEdit}
      >
        <form className="delivery-editor" onSubmit={this.submitHandler}>
          <Input
            id="pickupAddress"
            label="Pickup address"
            control="input"
            value={this.state.pickupAddress.value}
            valid={this.state.pickupAddress.valid}
            touched={this.state.pickupAddress.touched}
            onChange={this.inputChangeHandler}
          />
          <Input
            id="dropoffAddress"
            label="Dropoff address"
            control="input"
            value={this.state.dropoffAddress.value}
            valid={this.state.dropoffAddress.valid}
            touched={this.state.dropoffAddress.touched}
            onChange={this.inputChangeHandler}
          />
          <Input
            id="customerName"
            label="Customer name"
            control="input"
            value={this.state.customerName.value}
            valid={this.state.customerName.valid}
            touched={this.state.customerName.touched}
            onChange={this.inputChangeHandler}
          />
          <Input
            id="customerPhone"
            label="Customer phone"
            control="input"
            value={this.state.customerPhone.value}
            valid={this.state.customerPhone.valid}
            touched={this.state.customerPhone.touched}
            onChange={this.inputChangeHandler}
          />
          <Input
            id="price"
            label="Price"
            type="number"
            control="input"
            value={this.state.price.value}
            valid={this.state.price.valid}
            touched={this.state.price.touched}
            onChange={this.inputChangeHandler}
          />
          <Input
            id="notes"
            label="Notes"
            control="textarea"
            rows="4"
            value={this.state.notes.value}
            valid={this.state.notes.valid}
            touched={this.state.notes.touched}
            onChange={this.inputChangeHandler}
          />
          <div className="delivery-editor__actions">
            <Button mode="flat" onClick={this.props.onCancelEdit}>
              Cancel
            </Button>
            <Button type="submit" disabled={this.props.loading}>
              {this.props.loading ? 'Saving...' : 'Save delivery'}
            </Button>
          </div>
        </form>
      </Modal>
    );
  }
}

export default DeliveryEditor;
