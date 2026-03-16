import { TOKEN_KEY, USER_KEY } from "./config";
let redirecting = false;

export function getToken() {
  return uni.getStorageSync(TOKEN_KEY) || "";
}

export function getUser() {
  return uni.getStorageSync(USER_KEY) || null;
}

export function setSession(token, user) {
  uni.setStorageSync(TOKEN_KEY, token || "");
  uni.setStorageSync(USER_KEY, user || null);
}

export function updateUser(partial) {
  const current = getUser() || {};
  const next = { ...current, ...(partial || {}) };
  uni.setStorageSync(USER_KEY, next);
  return next;
}

export function clearSession() {
  uni.removeStorageSync(TOKEN_KEY);
  uni.removeStorageSync(USER_KEY);
}

export function ensureLogin() {
  if (getToken()) return true;
  if (!redirecting) {
    redirecting = true;
    uni.reLaunch({ url: "/pages/login/index" });
    setTimeout(() => {
      redirecting = false;
    }, 800);
  }
  return false;
}
