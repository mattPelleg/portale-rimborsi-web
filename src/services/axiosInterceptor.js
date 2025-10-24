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
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token scaduto o non valido
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;