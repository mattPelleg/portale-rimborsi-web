// src/services/axiosInstance.js
import axios from 'axios';
import authService from './authService';

const axiosInstance = axios.create({
  baseURL: '/portaleRimborsi-ws'
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  isRefreshing = false;
  failedQueue = [];
};

// ===== REQUEST INTERCEPTOR =====
axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
    if (token) {
      console.log('Aggiungendo token al header');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('Nessun token disponibile');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== RESPONSE INTERCEPTOR =====
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Risposta OK:', response.config.url);
    return response;
  },
  
  async (error) => {
    const originalRequest = error.config;
    
    console.log('Errore risposta:', error.response?.status, originalRequest.url);
    
    // Se è 401 e NON abbiamo ancora provato a refreshare
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Escludi login/logout/refresh da retry
      if (originalRequest.url.includes('/auth/login') || 
          originalRequest.url.includes('/auth/logout') || 
          originalRequest.url.includes('/auth/refresh')) {
        console.log('Escludendo endpoint di auth da refresh');
        return Promise.reject(error);
      }
      
      if (isRefreshing) {
        console.log('Refresh già in corso, mettendo in coda...');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        console.log('Tentando refresh del token...');
        const newAccessToken = await authService.refreshAccessToken();
        console.log('Refresh riuscito');
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        console.log('Refresh fallito, logout forzato');
        authService.clearAuth();
        window.location.href = '/login';
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      }
    }
    
    // Per altri errori: passa l'errore al componente
    return Promise.reject(error);
  }
);

export default axiosInstance;