import React, { Component, Fragment } from 'react';

import Button from '../../components/Button/Button';
import DeliveryCard from '../../components/Delivery/DeliveryCard/DeliveryCard';
import DeliveryEditor from '../../components/Delivery/DeliveryEditor/DeliveryEditor';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';
import Loader from '../../components/Loader/Loader';
import {
  createDelivery,
  deleteDelivery,
  getMyDeliveries,
  updateDelivery
} from '../../util/api';
import {
  BUSINESS_READY_STATUS,
  getBusinessSummary
} from '../../util/delivery';
import './BusinessDashboard.css';

class BusinessDashboard extends Component {
  state = {
    isEditing: false,
    deliveries: [],
    selectedDelivery: null,
    deliveriesLoading: true,
    saveLoading: false,
    error: null
  };

  componentDidMount() {
    // Fetches the business-owned deliveries the moment the dashboard is shown.
    this.loadDeliveries();
  }

  // Reloads the source of truth from the API after create, edit, publish, or delete actions.
  loadDeliveries = () => {
    this.setState({ deliveriesLoading: true });

    getMyDeliveries(this.props.token)
      .then(data => {
        this.setState({
          deliveries: data.deliveries || [],
          deliveriesLoading: false
        });
      })
      .catch(this.catchError);
  };

  // Opens the modal in create mode by clearing any previously selected delivery.
  newDeliveryHandler = () => {
    this.setState({ isEditing: true, selectedDelivery: null });
  };

  // Finds the clicked delivery and injects it into the editor modal for inline updates.
  startEditDeliveryHandler = deliveryId => {
    this.setState(prevState => ({
      isEditing: true,
      selectedDelivery: prevState.deliveries.find(
        delivery => delivery._id === deliveryId
      )
    }));
  };

  // Closes the editor modal without mutating the list data.
  cancelEditHandler = () => {
    this.setState({ isEditing: false, selectedDelivery: null });
  };

  // Decides whether the modal submission should create a new delivery or update an existing one.
  finishEditHandler = deliveryData => {
    const request = this.state.selectedDelivery
      ? updateDelivery(
          this.state.selectedDelivery._id,
          deliveryData,
          this.props.token
        )
      : createDelivery(deliveryData, this.props.token);

    this.setState({ saveLoading: true });

    request
      .then(() => {
        this.setState({
          isEditing: false,
          selectedDelivery: null,
          saveLoading: false
        });
        this.loadDeliveries();
      })
      .catch(error => {
        this.setState({ saveLoading: false });
        this.catchError(error);
      });
  };

  // Pushes a CREATED delivery into READY_FOR_PICKUP so drivers can see it on their board.
  publishDeliveryHandler = deliveryId => {
    updateDelivery(
      deliveryId,
      { status: BUSINESS_READY_STATUS },
      this.props.token
    )
      .then(() => {
        this.loadDeliveries();
      })
      .catch(this.catchError);
  };

  // Removes a delivery only when the backend still allows it to be deleted.
  deleteDeliveryHandler = deliveryId => {
    this.setState({ deliveriesLoading: true });

    deleteDelivery(deliveryId, this.props.token)
      .then(() => {
        this.loadDeliveries();
      })
      .catch(this.catchError);
  };

  // Hides the local page-level error modal after the user acknowledges it.
  errorHandler = () => {
    this.setState({ error: null });
  };

  // Normalizes page errors so loaders stop even when an API request fails.
  catchError = error => {
    this.setState({
      error: error,
      deliveriesLoading: false
    });
  };

  render() {
    const summary = getBusinessSummary(this.state.deliveries);

    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <DeliveryEditor
          editing={this.state.isEditing}
          selectedDelivery={this.state.selectedDelivery}
          loading={this.state.saveLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />
        <section className="dashboard-hero">
          <div>
            <p className="dashboard-hero__eyebrow">Business workspace</p>
            <h1>Plan deliveries before the drivers take over</h1>
            <p>
              This page mirrors the old scaffold structure, but its domain logic now targets pickup, route,
              customer, and status management.
            </p>
          </div>
          <Button mode="raised" design="accent" onClick={this.newDeliveryHandler}>
            Create delivery
          </Button>
        </section>
        <section className="dashboard-summary">
          <article>
            <strong>{summary.total}</strong>
            <span>Total deliveries</span>
          </article>
          <article>
            <strong>{summary.created}</strong>
            <span>Drafts</span>
          </article>
          <article>
            <strong>{summary.ready}</strong>
            <span>Ready for pickup</span>
          </article>
          <article>
            <strong>{summary.active}</strong>
            <span>In progress</span>
          </article>
        </section>
        <section className="dashboard-list">
          {this.state.deliveriesLoading && (
            <div className="dashboard-loader">
              <Loader />
            </div>
          )}
          {!this.state.deliveriesLoading && this.state.deliveries.length === 0 && (
            <p className="dashboard-empty">
              No deliveries yet. Start by creating one draft delivery.
            </p>
          )}
          {!this.state.deliveriesLoading &&
            this.state.deliveries.map(delivery => (
              <DeliveryCard
                key={delivery._id}
                delivery={delivery}
                mode="business"
                onEdit={this.startEditDeliveryHandler}
                onPublish={this.publishDeliveryHandler}
                onDelete={this.deleteDeliveryHandler}
              />
            ))}
        </section>
      </Fragment>
    );
  }
}

export default BusinessDashboard;
