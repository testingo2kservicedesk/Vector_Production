import axios from "axios";
import Swal from "sweetalert2";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";
const STORAGE_KEY = "vector_auth";

const api = axios.create({ baseURL: API_BASE_URL });
let activeMutations = 0;
let activeRequests = 0;
const GET_CACHE_TTL_MS = 30_000;
const getCache = new Map();

function cacheKey(config) {
  const params = new URLSearchParams(config.params || {}).toString();
  return `${config.baseURL || ""}${config.url || ""}${params ? `?${params}` : ""}`;
}

function copyData(data) {
  return typeof structuredClone === "function"
    ? structuredClone(data)
    : JSON.parse(JSON.stringify(data));
}

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
  const method = String(config.method || "get").toLowerCase();
  if (method === "get") {
    const key = cacheKey(config);
    const cached = getCache.get(key);
    if (cached && Date.now() - cached.savedAt < GET_CACHE_TTL_MS) {
      config.adapter = () => Promise.resolve({
        data: copyData(cached.data), status: 200, statusText: "OK",
        headers: { "x-vector-cache": "hit" }, config, request: null,
      });
    } else if (cached) {
      getCache.delete(key);
    }
    config.__vectorCacheKey = key;
  } else if (!["head", "options"].includes(method)) {
    // A successful save can affect dashboard totals and every table, so do
    // not show stale data after any create, edit, or deletion.
    getCache.clear();
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
    if (response.config.__vectorCacheKey && response.headers?.["x-vector-cache"] !== "hit") {
      getCache.set(response.config.__vectorCacheKey, { data: copyData(response.data), savedAt: Date.now() });
    }
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
