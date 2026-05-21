const AUTH_BASE_URL = 'http://localhost:3000';
const DELIVERY_BASE_URL = 'http://localhost:5001';

// Wraps fetch so every page can reuse the same JSON parsing and error normalization rules.
const request = async (url, options = {}) => {
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    body: options.body ? JSON.stringify(options.body) : null
  });

  let data = {};

  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }

  if (!response.ok) {
    const requestError = new Error(data.message || 'Request failed.');
    requestError.statusCode = response.status;
    requestError.data = data.data;
    throw requestError;
  }

  return data;
};

// Sends login credentials to the auth-service and returns the session payload.
export const login = credentials =>
  request(`${AUTH_BASE_URL}/auth/login`, {
    method: 'POST',
    body: credentials
  });

// Creates a new business or driver user in the auth-service.
export const signup = payload =>
  request(`${AUTH_BASE_URL}/auth/signup`, {
    method: 'POST',
    body: payload
  });

// Fetches the deliveries that belong to the currently logged-in business.
export const getMyDeliveries = token =>
  request(`${DELIVERY_BASE_URL}/deliveries/me`, {
    token: token
  });

// Fetches deliveries that drivers are still allowed to claim.
export const getAvailableDeliveries = token =>
  request(`${DELIVERY_BASE_URL}/deliveries/all`, {
    token: token
  });

// Reads a single delivery by id from the driver API surface.
export const getDriverDeliveryById = (deliveryId, token) =>
  request(`${DELIVERY_BASE_URL}/deliveries/all/${deliveryId}`, {
    token: token
  }).then(data => data.delivery);

// Creates a new delivery under the logged-in business account.
export const createDelivery = (payload, token) =>
  request(`${DELIVERY_BASE_URL}/deliveries`, {
    method: 'POST',
    token: token,
    body: payload
  });

// Updates an existing business-owned delivery.
export const updateDelivery = (deliveryId, payload, token) =>
  request(`${DELIVERY_BASE_URL}/deliveries/${deliveryId}`, {
    method: 'PUT',
    token: token,
    body: payload
  });

// Deletes a business-owned delivery.
export const deleteDelivery = (deliveryId, token) =>
  request(`${DELIVERY_BASE_URL}/deliveries/${deliveryId}`, {
    method: 'DELETE',
    token: token
  });

// Claims a READY_FOR_PICKUP delivery for the current driver.
export const claimDelivery = (deliveryId, token) =>
  request(`${DELIVERY_BASE_URL}/deliveries/${deliveryId}/claim`, {
    method: 'PATCH',
    token: token
  });

// Progresses a claimed delivery through the driver's allowed status flow.
export const updateDriverDeliveryStatus = (deliveryId, payload, token) =>
  request(`${DELIVERY_BASE_URL}/deliveries/${deliveryId}/status`, {
    method: 'PATCH',
    token: token,
    body: payload
  });
