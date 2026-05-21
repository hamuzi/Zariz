const TOKEN_STORAGE_KEY = 'zariz_token';
const USER_STORAGE_KEY = 'zariz_user_id';
const ROLE_STORAGE_KEY = 'zariz_role';
const ACTIVE_STORAGE_KEY = 'zariz_is_active';
const EXPIRY_STORAGE_KEY = 'zariz_expiry_date';

// Decodes the JWT payload so the frontend can learn the role and active flag returned by the backend.
export const decodeTokenPayload = token => {
  try {
    const base64Payload = token.split('.')[1];
    const normalizedPayload = base64Payload
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const jsonPayload = atob(normalizedPayload);

    return JSON.parse(jsonPayload);
  } catch (error) {
    return {};
  }
};

// Persists the session in localStorage and enriches it with metadata derived from the JWT.
export const saveSession = session => {
  const payload = decodeTokenPayload(session.token);
  const remainingMilliseconds = 60 * 60 * 1000;
  const expiryDate = new Date(Date.now() + remainingMilliseconds);
  const storedSession = {
    token: session.token,
    userId: session.userId,
    role: payload.role || null,
    isActive: Boolean(payload.isActive),
    expiryDate: expiryDate.toISOString(),
    remainingMilliseconds: remainingMilliseconds
  };

  localStorage.setItem(TOKEN_STORAGE_KEY, storedSession.token);
  localStorage.setItem(USER_STORAGE_KEY, storedSession.userId);
  localStorage.setItem(ROLE_STORAGE_KEY, storedSession.role || '');
  localStorage.setItem(ACTIVE_STORAGE_KEY, String(storedSession.isActive));
  localStorage.setItem(EXPIRY_STORAGE_KEY, storedSession.expiryDate);

  return storedSession;
};

// Removes all session fields so the next page load starts from a clean unauthenticated state.
export const clearSession = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(ROLE_STORAGE_KEY);
  localStorage.removeItem(ACTIVE_STORAGE_KEY);
  localStorage.removeItem(EXPIRY_STORAGE_KEY);
};

// Restores a valid session from localStorage and rejects expired tokens before App bootstraps.
export const restoreSession = () => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const userId = localStorage.getItem(USER_STORAGE_KEY);
  const expiryDate = localStorage.getItem(EXPIRY_STORAGE_KEY);

  if (!token || !userId || !expiryDate) {
    return null;
  }

  const expiryDateObject = new Date(expiryDate);

  if (expiryDateObject <= new Date()) {
    clearSession();
    return null;
  }

  const payload = decodeTokenPayload(token);

  return {
    token: token,
    userId: userId,
    role: localStorage.getItem(ROLE_STORAGE_KEY) || payload.role || null,
    isActive:
      localStorage.getItem(ACTIVE_STORAGE_KEY) === 'true' ||
      Boolean(payload.isActive),
    remainingMilliseconds: expiryDateObject.getTime() - Date.now()
  };
};
