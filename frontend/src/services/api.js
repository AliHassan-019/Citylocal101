import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 second timeout
});

// Request retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function to delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add retry count if not present
  config.__retryCount = config.__retryCount || 0;
  
  return config;
});

// Handle response errors with retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to appropriate login based on current route
      const isAdminRoute = window.location.pathname.startsWith('/admin');
      window.location.href = isAdminRoute ? '/admin/login' : '/login';
      return Promise.reject(error);
    }

    // Handle 429 Too Many Requests with retry logic
    if (error.response?.status === 429) {
      const retryCount = originalRequest.__retryCount || 0;
      
      if (retryCount < MAX_RETRIES) {
        originalRequest.__retryCount = retryCount + 1;
        
        // Calculate delay with exponential backoff
        const retryDelay = RETRY_DELAY * Math.pow(2, retryCount);
        
        // Wait before retrying
        await delay(retryDelay);
        
        // Retry the request
        return api(originalRequest);
      } else {
        // Max retries exceeded, show user-friendly error
        const retryAfter = error.response?.data?.retryAfter || 60;
        return Promise.reject({
          ...error,
          message: `Too many requests. Please wait ${retryAfter} seconds and try again.`
        });
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default api;

