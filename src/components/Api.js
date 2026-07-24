import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";
const STORAGE_KEY = "vector_auth";

const api = axios.create({ baseURL: API_BASE_URL });

// Attach the stored JWT to every outgoing request.
api.interceptors.request.use((config) => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const { token } = JSON.parse(raw);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // ignore malformed storage
  }
  return config;
});

// If the token is missing/expired/rejected, bounce back to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem(STORAGE_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
