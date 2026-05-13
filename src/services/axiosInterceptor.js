import axios from 'axios';
import authService from './authService';

// Interceptor per aggiungere il token a ogni richiesta
axios.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor per gestire risposte 401 (token scaduto)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLogoutCall = error.config?.url?.includes('/auth/logout');
      const isLoginCall  = error.config?.url?.includes('/auth/login');
      
      if (!isLogoutCall && !isLoginCall) {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axios;