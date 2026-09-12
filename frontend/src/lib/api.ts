import axios from 'axios';

// Create central Axios instance
const API = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization header if token exists
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('synexora_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling 401 Unauthorized errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('synexora_token');
      localStorage.removeItem('synexora_user');
    }
    return Promise.reject(error);
  }
);

export default API;
