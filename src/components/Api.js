import axios from "axios";
import Swal from "sweetalert2";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";
const STORAGE_KEY = "vector_auth";

const api = axios.create({ baseURL: API_BASE_URL });
let activeMutations = 0;
let activeRequests = 0;

function publishRequestState() {
  window.dispatchEvent(new CustomEvent("vector:api-loading", {
    detail: { loading: activeRequests > 0, count: activeRequests },
  }));
}

function publishMutationState() {
  window.dispatchEvent(new CustomEvent("vector:api-busy", { detail: { busy: activeMutations > 0 } }));
  if (activeMutations > 0 && !Swal.isVisible()) {
    Swal.fire({
      title: "Processing…",
      text: "Please wait while we complete your request.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
      customClass: { popup: "swal-vector-popup" },
    });
  }
  if (activeMutations === 0 && Swal.isVisible()) Swal.close();
}

// Attach the stored JWT to every outgoing request.
api.interceptors.request.use((config) => {
  config.__vectorRequest = true;
  activeRequests += 1;
  publishRequestState();
  if (!["get", "head", "options"].includes(String(config.method || "get").toLowerCase())) {
    config.__vectorMutation = true;
    activeMutations += 1;
    publishMutationState();
  }
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
  (response) => {
    if (response.config.__vectorRequest) { activeRequests = Math.max(0, activeRequests - 1); publishRequestState(); }
    if (response.config.__vectorMutation) { activeMutations = Math.max(0, activeMutations - 1); publishMutationState(); }
    return response;
  },
  (error) => {
    if (error.config?.__vectorRequest) { activeRequests = Math.max(0, activeRequests - 1); publishRequestState(); }
    if (error.config?.__vectorMutation) { activeMutations = Math.max(0, activeMutations - 1); publishMutationState(); }
    if (error.response?.status === 401) {
      sessionStorage.removeItem(STORAGE_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
