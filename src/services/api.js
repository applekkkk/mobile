import { request } from "../utils/request";

export const authApi = {
  login: (data) => request("/auth/login", { method: "POST", data })
};

export const userApi = {
  getById: (id) => request(`/users/${id}`),
  checkIn: (id) => request(`/users/${id}/checkin`, { method: "POST" })
};

export const productApi = {
  getList: (userId) =>
    request("/products/query", {
      method: "POST",
      data: {
        pageNum: 1,
        pageSize: 100,
        userId: userId || null
      }
    }),
  getById: (id, userId) => request(`/products/${id}`, { params: { userId } }),
  getFavorites: (userId) => request(`/products/favorites/${userId}`)
};

export const orderApi = {
  create: (data) => request("/orders", { method: "POST", data }),
  getUserList: (userId) => request(`/orders/user/${userId}`)
};

export const taskApi = {
  getMarket: (userId) => request("/custom-requests", { params: { userId } }),
  getById: (id) => request(`/custom-requests/${id}`),
  accept: (id, params) => request(`/custom-requests/${id}/accept`, { method: "PUT", params }),
  getUserList: (userId) => request(`/custom-requests/user/${userId}`),
  getAll: () => request("/custom-requests/all")
};
