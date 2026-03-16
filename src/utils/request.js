import { BASE_URL } from "./config";
import { clearSession, getToken } from "./auth";

function buildUrl(path, params) {
  const query = Object.entries(params || {})
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
  return `${BASE_URL}${path}${query ? `?${query}` : ""}`;
}

export function request(path, options = {}) {
  const token = getToken();
  const {
    method = "GET",
    data = null,
    params = null,
    showError = true
  } = options;

  return new Promise((resolve, reject) => {
    uni.request({
      url: buildUrl(path, params),
      method,
      data,
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success: (res) => {
        const payload = res?.data || {};
        if (payload?.code === 401) {
          clearSession();
          if (showError) uni.showToast({ title: "登录已失效，请重新登录", icon: "none" });
          reject(new Error("登录已失效，请重新登录"));
          return;
        }
        if (typeof payload?.code === "number" && payload.code !== 200) {
          const msg = payload?.message || "请求失败";
          if (showError) uni.showToast({ title: msg, icon: "none" });
          reject(new Error(msg));
          return;
        }
        resolve(payload);
      },
      fail: (err) => {
        const msg = err?.errMsg ? `网络错误: ${err.errMsg}` : "网络错误，请稍后重试";
        if (showError) uni.showToast({ title: msg, icon: "none" });
        reject(new Error(msg));
      }
    });
  });
}
