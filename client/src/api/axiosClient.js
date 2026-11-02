import axios from 'axios';
import { BASE_URL } from '../constants/urls.js';

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios Request Interceptor
API.interceptors.request.use(
  (config) => {
    // Automatically attach user's local timezone for date & week calculations
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    config.headers['x-timezone'] = timezone;
    return config;
  },
  (error) => Promise.reject(error)
);

// Axios Response Interceptor
API.interceptors.response.use(
  (response) => {
    // Return data payload directly for streamlined API consumption
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const errorData = error.response?.data?.error;

    if (status === 400 || status === 422) {
      console.warn('[API Validation Error]', errorData?.message || error.message);
    }

    // Build unified error object
    const normalizedError = new Error(
      errorData?.message || error.message || 'An error occurred while communicating with the server'
    );
    normalizedError.status = status;
    normalizedError.code = errorData?.code || 'API_ERROR';
    normalizedError.details = errorData?.details || [];

    return Promise.reject(normalizedError);
  }
);

export default API;
