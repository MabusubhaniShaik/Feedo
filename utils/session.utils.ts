// utils/session.utils.ts

/**
 * Safely gets and parses an item from sessionStorage
 */
export const getSessionItem = <T>(key: string): T | null => {
  if (typeof window === "undefined") return null;

  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error parsing sessionStorage item "${key}":`, error);
    return null;
  }
};

/**
 * Safely sets an item in sessionStorage
 */
export const setSessionItem = <T>(key: string, value: T): void => {
  if (typeof window === "undefined") return;

  try {
    const serialized = JSON.stringify(value);
    sessionStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`Error setting sessionStorage item "${key}":`, error);
  }
};

/**
 * Removes an item from sessionStorage
 */
export const removeSessionItem = (key: string): void => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(key);
};

/**
 * Clears all items from sessionStorage
 */
export const clearSessionStorage = (): void => {
  if (typeof window === "undefined") return;
  sessionStorage.clear();
};

/**
 * Gets user info from sessionStorage
 */
export const getUserInfo = () => {
  return getSessionItem<{
    id?: string;
    _id?: string;
    role?: string;
    role_name?: string;
    name?: string;
    email?: string;
  }>("user_info");
};

/**
 * Gets user role from sessionStorage
 */
export const getUserRole = (): string | null => {
  const userInfo = getUserInfo();
  return userInfo?.role || userInfo?.role_name || null;
};

/**
 * Gets user ID from sessionStorage
 */
export const getUserId = (): string | null => {
  const userInfo = getUserInfo();
  return userInfo?.id || userInfo?._id || null;
};

/**
 * Gets access token from sessionStorage
 */
export const getAccessToken = (): string | null => {
  return sessionStorage.getItem("access_token");
};

/**
 * Checks if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAccessToken() && !!getUserInfo();
};
