// Rejects empty strings in required text fields.
export const required = value => String(value).trim() !== '';

// Builds reusable min/max length validators so different forms can share the same logic.
export const length = config => value => {
  const stringValue = String(value || '').trim();
  let isValid = true;

  if (config.min) {
    isValid = isValid && stringValue.length >= config.min;
  }

  if (config.max) {
    isValid = isValid && stringValue.length <= config.max;
  }

  return isValid;
};

// Checks email fields before they are sent to the auth-service.
export const email = value =>
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i.test(
    value
  );

// Keeps phone validation permissive enough for a scaffold while still blocking clearly invalid values.
export const phone = value => /^[0-9+() -]{7,20}$/.test(String(value || '').trim());

// Allows empty prices to become zero while blocking negative or non-numeric values.
export const positiveNumber = value => {
  if (value === '' || value === null || value === undefined) {
    return true;
  }

  return !Number.isNaN(Number(value)) && Number(value) >= 0;
};
