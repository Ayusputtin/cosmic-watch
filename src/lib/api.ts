import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cosmic_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear storage and potentially redirect to login
      // We avoid window.location.href here to let React Router handle it if possible,
      // but strictly clearing token is good practice.
      localStorage.removeItem('cosmic_token');
      localStorage.removeItem('cosmic_user');
      localStorage.removeItem('cosmicwatch_isAuthenticated'); // Legacy cleanup
    }
    return Promise.reject(error);
  }
);

export default api;
