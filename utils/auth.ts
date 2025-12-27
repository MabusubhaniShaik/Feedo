// utils/auth.ts
export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;

  const accessToken = sessionStorage.getItem("access_token");
  const userInfoStr = sessionStorage.getItem("user_info");

  if (!accessToken || !userInfoStr) return false;

  try {
    const userInfo = JSON.parse(userInfoStr);
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if token is expired (with 60 seconds buffer)
    if (userInfo.token_expiry && userInfo.token_expiry < currentTime + 60) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

export const getUserInfo = () => {
  if (typeof window === "undefined") return null;

  try {
    const userInfoStr = sessionStorage.getItem("user_info");
    return userInfoStr ? JSON.parse(userInfoStr) : null;
  } catch {
    return null;
  }
};

export const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("access_token");
};

export const logout = () => {
  if (typeof window === "undefined") return;
  sessionStorage.clear();
  window.location.href = "/signin";
};
