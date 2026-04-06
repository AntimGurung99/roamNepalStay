import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const bookingsAPI = {
  createBooking: (data) => API.post("/bookings/", data),
  getMyBookings: () => API.get("/bookings/my/"),
  getBookingDetails: (id) => API.get(`/bookings/${id}/`),
  cancelBooking: (id) => API.post(`/bookings/${id}/cancel/`),
  downloadReceipt: (id) =>
    API.get(`/bookings/${id}/receipt/`, {
      responseType: "blob",
    }),
};

export const paymentsAPI = {
  initiateKhaltiPayment: (bookingId) =>
    API.post(`/bookings/${bookingId}/initiate-payment/`),

  verifyKhaltiPayment: (data) =>
    API.post("/bookings/verify-payment/", data),

  initiateEsewaPayment: (bookingId) =>
    API.post(`/bookings/${bookingId}/initiate-esewa/`),

  verifyEsewaPayment: (data) =>
    API.post("/bookings/verify-esewa-payment/", data),

  selectCashInHand: (bookingId) =>
    API.post(`/bookings/${bookingId}/cash-in-hand/`),
};

export const reviewsAPI = {
  createReview: (bookingId, data) =>
    API.post(`/bookings/${bookingId}/review/`, data),
};

export const listingsAPI = {
  getListing: (id) => API.get(`/listings/${id}/`),
  getBookedDates: (id) => API.get(`/listings/${id}/booked_dates/`),
  getMapListings: (params) => API.get("/listings/map/", { params }),
};

export const platformSettingsAPI = {
  getSettings: () => API.get("/platform-settings/"),
  updateSettings: (data) => API.patch("/platform-settings/", data),
  getPublicFee: () => API.get("/public/platform-fee/"),
};

export const aiAPI = {
  homeChat: (message) => API.post("/ai/home-chat/", { message }),
};

export const notificationsAPI = {
  getNotifications: (params = {}) => API.get("/notifications/", { params }),
  markAsRead: (id) => API.post(`/notifications/${id}/read/`),
  markAllAsRead: (params = {}) =>
    API.post("/notifications/mark-all-read/", null, { params }),
  deleteNotification: (id) => API.delete(`/notifications/${id}/`),
};

export default API;