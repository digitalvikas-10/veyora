import axios from 'axios';

// Determine base API URL safely
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
  if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
    return '/api/v1';
  }
  return envUrl.endsWith('/api/v1') ? envUrl : `${envUrl}/api/v1`;
};

/**
 * Pre-configured Axios instance for VEYORA
 * - Base URL directed to /api/v1
 * - withCredentials: true ensures HTTP-only cookies (access & refresh tokens) are sent
 */
const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

let inMemoryToken = typeof window !== 'undefined' ? localStorage.getItem('veyora_access_token') : null;

export const setAuthToken = (token) => {
  inMemoryToken = token;
  if (token) {
    try {
      localStorage.setItem('veyora_access_token', token);
    } catch {}
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    try {
      localStorage.removeItem('veyora_access_token');
    } catch {}
    delete api.defaults.headers.common['Authorization'];
  }
};

export const getAuthToken = () => inMemoryToken;

// Request Interceptor: Attach workspace ID if set in local memory or headers
api.interceptors.request.use(
  (config) => {
    const activeWorkspaceId = typeof window !== 'undefined' ? sessionStorage.getItem('veyora_active_workspace_id') : null;
    if (activeWorkspaceId) {
      config.headers['X-Workspace-Id'] = activeWorkspaceId;
    }
    const token = inMemoryToken || (typeof window !== 'undefined' ? localStorage.getItem('veyora_access_token') : null);
    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error messages uniformly & support retry on 401
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Auto-refresh token if 401 encountered and not already retried, except for auth endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/refresh-token')
    ) {
      originalRequest._retry = true;
      try {
        const refreshRes = await axios.post(
          `${getBaseURL()}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        const newAccessToken = refreshRes.data?.data?.accessToken;
        if (newAccessToken) {
          setAuthToken(newAccessToken);
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        setAuthToken(null);
        sessionStorage.removeItem('veyora_active_workspace_id');
      }
    }

    const errorResponse = {
      success: false,
      message: error.response?.data?.message || error.message || 'Network error occurred',
      errors: error.response?.data?.errors || [],
      status: error.response?.status,
      data: error.response?.data,
    };
    return Promise.reject(errorResponse);
  }
);

export { api };
export default api;
