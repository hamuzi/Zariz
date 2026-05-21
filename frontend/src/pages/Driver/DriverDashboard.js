import React, { Component, Fragment } from 'react';

import DeliveryCard from '../../components/Delivery/DeliveryCard/DeliveryCard';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';
import Loader from '../../components/Loader/Loader';
import {
  claimDelivery,
  getAvailableDeliveries,
  getDriverDeliveryById,
  updateDriverDeliveryStatus
} from '../../util/api';
import {
  getDriverNextStatus,
  readClaimedDeliveryIds,
  storeClaimedDeliveryIds
} from '../../util/delivery';
import './DriverDashboard.css';

class DriverDashboard extends Component {
  state = {
    availableDeliveries: [],
    claimedDeliveries: [],
    deliveriesLoading: true,
    busyDeliveryId: null,
    error: null
  };

  componentDidMount() {
    // Loads the open market deliveries and also restores any claimed IDs saved in localStorage.
    this.loadDashboard();
  }

  // Rebuilds the driver board from both the backend and the locally stored claimed delivery IDs.
  loadDashboard = () => {
    const claimedIds = readClaimedDeliveryIds();

    Promise.all([
      getAvailableDeliveries(this.props.token),
      Promise.all(
        claimedIds.map(id =>
          getDriverDeliveryById(id, this.props.token).catch(() => null)
        )
      )
    ])
      .then(([availableData, claimedResults]) => {
        const claimedDeliveries = claimedResults.filter(Boolean);

        storeClaimedDeliveryIds(claimedDeliveries.map(delivery => delivery._id));

        this.setState({
          availableDeliveries: availableData.deliveries || [],
          claimedDeliveries: claimedDeliveries,
          deliveriesLoading: false
        });
      })
      .catch(this.catchError);
  };

  // Claims one available delivery and immediately mirrors that change into the local claimed list.
  claimDeliveryHandler = deliveryId => {
    this.setState({ busyDeliveryId: deliveryId });

    claimDelivery(deliveryId, this.props.token)
      .then(data => {
        this.setState(prevState => {
          const claimedDeliveries = [data.delivery, ...prevState.claimedDeliveries];
          storeClaimedDeliveryIds(claimedDeliveries.map(delivery => delivery._id));

          return {
            availableDeliveries: prevState.availableDeliveries.filter(
              delivery => delivery._id !== deliveryId
            ),
            claimedDeliveries: claimedDeliveries,
            busyDeliveryId: null
          };
        });
      })
      .catch(error => {
        this.setState({ busyDeliveryId: null });
        this.catchError(error);
      });
  };

  // Moves a claimed delivery to its next allowed backend status without skipping steps.
  advanceStatusHandler = deliveryId => {
    const currentDelivery = this.state.claimedDeliveries.find(
      delivery => delivery._id === deliveryId
    );
    const nextStatus = getDriverNextStatus(currentDelivery?.status);

    if (!nextStatus) {
      return;
    }

    this.setState({ busyDeliveryId: deliveryId });

    updateDriverDeliveryStatus(
      deliveryId,
      { status: nextStatus.value },
      this.props.token
    )
      .then(data => {
        this.setState(prevState => ({
          claimedDeliveries: prevState.claimedDeliveries.map(delivery =>
            delivery._id === deliveryId ? data.delivery : delivery
          ),
          busyDeliveryId: null
        }));
      })
      .catch(error => {
        this.setState({ busyDeliveryId: null });
        this.catchError(error);
      });
  };

  // Removes the current error modal from the screen.
  errorHandler = () => {
    this.setState({ error: null });
  };

  // Stops the loaders and stores the error in one place for the modal component.
  catchError = error => {
    this.setState({
      error: error,
      deliveriesLoading: false
    });
  };

  render() {
    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <section className="driver-hero">
          <div>
            <p className="driver-hero__eyebrow">Driver workspace</p>
            <h1>Claim available work and progress it one step at a time</h1>
            <p>
              This side of the scaffold is organized around the driver workflow exposed by your current delivery API.
            </p>
          </div>
          <div className="driver-hero__status">
            <strong>{this.props.isActive ? 'Active' : 'Inactive'}</strong>
            <span>
              {this.props.isActive
                ? 'You can claim deliveries.'
                : 'The backend blocks claims until the driver is active.'}
            </span>
          </div>
        </section>
        <div className="driver-columns">
          <section className="driver-section">
            <div className="driver-section__header">
              <h2>Available deliveries</h2>
              <span>{this.state.availableDeliveries.length}</span>
            </div>
            {this.state.deliveriesLoading && <Loader />}
            {!this.state.deliveriesLoading &&
              this.state.availableDeliveries.length === 0 && (
                <p className="driver-section__empty">
                  No deliveries are waiting for pickup right now.
                </p>
              )}
            {!this.state.deliveriesLoading &&
              this.state.availableDeliveries.map(delivery => (
                <DeliveryCard
                  key={delivery._id}
                  delivery={delivery}
                  mode="driver"
                  loading={this.state.busyDeliveryId === delivery._id || !this.props.isActive}
                  onClaim={this.claimDeliveryHandler}
                />
              ))}
          </section>
          <section className="driver-section">
            <div className="driver-section__header">
              <h2>Claimed deliveries</h2>
              <span>{this.state.claimedDeliveries.length}</span>
            </div>
            {this.state.claimedDeliveries.length === 0 && !this.state.deliveriesLoading && (
              <p className="driver-section__empty">
                Claimed deliveries will appear here and persist locally between refreshes.
              </p>
            )}
            {this.state.claimedDeliveries.map(delivery => (
              <DeliveryCard
                key={delivery._id}
                delivery={delivery}
                mode="driver"
                loading={this.state.busyDeliveryId === delivery._id}
                nextStatus={getDriverNextStatus(delivery.status)}
                onAdvanceStatus={this.advanceStatusHandler}
              />
            ))}
          </section>
        </div>
      </Fragment>
    );
  }
}

export default DriverDashboard;
