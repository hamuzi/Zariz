import {
  length,
  phone,
  positiveNumber,
  required
} from './validators';

const CLAIMED_DELIVERY_STORAGE_KEY = 'zariz_claimed_delivery_ids';

export const BUSINESS_READY_STATUS = 'READY_FOR_PICKUP';

export const STATUS_LABELS = {
  CREATED: 'Created',
  READY_FOR_PICKUP: 'Ready for pickup',
  ASSIGNED: 'Assigned',
  PICKED_UP: 'Picked up',
  ON_THE_WAY: 'On the way',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
};

export const STATUS_THEMES = {
  CREATED: 'draft',
  READY_FOR_PICKUP: 'ready',
  ASSIGNED: 'assigned',
  PICKED_UP: 'moving',
  ON_THE_WAY: 'moving',
  DELIVERED: 'done',
  CANCELLED: 'neutral'
};

const DRIVER_STATUS_FLOW = {
  ASSIGNED: { value: 'PICKED_UP', label: 'Picked Up' },
  PICKED_UP: { value: 'ON_THE_WAY', label: 'On The Way' },
  ON_THE_WAY: { value: 'DELIVERED', label: 'Delivered' }
};

// Converts a server timestamp into a readable short date for card metadata rows.
export const formatDeliveryDate = value =>
  new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

// Formats price values in a way that is visually stable across all cards and summaries.
export const formatPrice = value =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(Number(value || 0));

// Returns the next driver status if the current delivery can still advance.
export const getDriverNextStatus = currentStatus =>
  DRIVER_STATUS_FLOW[currentStatus] || null;

// Gives the editor modal one canonical initial field object for new and existing deliveries.
export const buildDeliveryDraft = delivery =>
  ({
    pickupAddress: {
      value: delivery?.pickupAddress || '',
      valid: delivery ? required(delivery.pickupAddress || '') : false,
      touched: false,
      validators: [required, length({ min: 4 })]
    },
    dropoffAddress: {
      value: delivery?.dropoffAddress || '',
      valid: delivery ? required(delivery.dropoffAddress || '') : false,
      touched: false,
      validators: [required, length({ min: 4 })]
    },
    customerName: {
      value: delivery?.customerName || '',
      valid: delivery ? required(delivery.customerName || '') : false,
      touched: false,
      validators: [required, length({ min: 2 })]
    },
    customerPhone: {
      value: delivery?.customerPhone || '',
      valid: delivery ? required(delivery.customerPhone || '') : false,
      touched: false,
      validators: [required, phone]
    },
    price: {
      value: delivery?.price ?? 0,
      valid: true,
      touched: false,
      validators: [positiveNumber]
    },
    notes: {
      value: delivery?.notes || '',
      valid: true,
      touched: false,
      validators: [length({ max: 300 })]
    }
  });

// Creates the business overview counters shown above the delivery list.
export const getBusinessSummary = deliveries =>
  deliveries.reduce(
    (summary, delivery) => {
      summary.total += 1;

      if (delivery.status === 'CREATED') {
        summary.created += 1;
      }

      if (delivery.status === 'READY_FOR_PICKUP') {
        summary.ready += 1;
      }

      if (['ASSIGNED', 'PICKED_UP', 'ON_THE_WAY'].includes(delivery.status)) {
        summary.active += 1;
      }

      return summary;
    },
    {
      total: 0,
      created: 0,
      ready: 0,
      active: 0
    }
  );

// Reads the locally saved claimed delivery IDs so the driver board can recover after refresh.
export const readClaimedDeliveryIds = () => {
  try {
    const rawValue = localStorage.getItem(CLAIMED_DELIVERY_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : [];
  } catch (error) {
    return [];
  }
};

// Persists claimed delivery IDs because the current backend does not expose a "my claimed deliveries" list endpoint.
export const storeClaimedDeliveryIds = ids => {
  localStorage.setItem(CLAIMED_DELIVERY_STORAGE_KEY, JSON.stringify(ids));
};
