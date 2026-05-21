import React from 'react';

import Button from '../../Button/Button';
import StatusBadge from '../../StatusBadge/StatusBadge';
import {
  formatDeliveryDate,
  formatPrice
} from '../../../util/delivery';
import './DeliveryCard.css';

// Builds the action row so the same card can serve both business and driver dashboards.
const renderActions = props => {
  if (props.mode === 'business') {
    return (
      <div className="delivery-card__actions">
        <Button mode="ghost" onClick={() => props.onEdit(props.delivery._id)}>
          Edit
        </Button>
        <Button
          mode="ghost"
          design="accent"
          onClick={() => props.onPublish(props.delivery._id)}
          disabled={props.delivery.status !== 'CREATED'}
        >
          Send To Pickup
        </Button>
        <Button
          mode="ghost"
          design="danger"
          onClick={() => props.onDelete(props.delivery._id)}
          disabled={props.delivery.driverId !== null}
        >
          Delete
        </Button>
      </div>
    );
  }

  return (
    <div className="delivery-card__actions">
      {!props.delivery.driverId && (
        <Button
          mode="raised"
          onClick={() => props.onClaim(props.delivery._id)}
          disabled={props.loading}
        >
          Claim Delivery
        </Button>
      )}
      {props.delivery.driverId && props.nextStatus && (
        <Button
          mode="ghost"
          design="accent"
          onClick={() => props.onAdvanceStatus(props.delivery._id)}
          disabled={props.loading}
        >
          Mark As {props.nextStatus.label}
        </Button>
      )}
    </div>
  );
};

const deliveryCard = props => (
  <article className="delivery-card">
    <div className="delivery-card__top">
      <div>
        <p className="delivery-card__eyebrow">
          Customer: {props.delivery.customerName}
        </p>
        <h3>{props.delivery.pickupAddress}</h3>
      </div>
      <StatusBadge status={props.delivery.status} />
    </div>
    <div className="delivery-card__route">
      <p>
        <strong>Pickup:</strong> {props.delivery.pickupAddress}
      </p>
      <p>
        <strong>Dropoff:</strong> {props.delivery.dropoffAddress}
      </p>
    </div>
    <div className="delivery-card__meta">
      <span>{props.delivery.customerPhone}</span>
      <span>{formatPrice(props.delivery.price)}</span>
      <span>{formatDeliveryDate(props.delivery.createdAt)}</span>
    </div>
    {props.delivery.notes && (
      <p className="delivery-card__notes">{props.delivery.notes}</p>
    )}
    {renderActions(props)}
  </article>
);

export default deliveryCard;
