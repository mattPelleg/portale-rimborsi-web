import axiosInstance from './axiosInstance';

class AuthService {
  
  async login(username, password) {
    try {
      // Per login usiamo axiosInstance (senza token)
      const response = await axiosInstance.post('/api/auth/login', {
        username,
        password
      });

      if (response.data.accessToken) {
        // Salva access token in memoria (volatile)
        this.setAccessToken(response.data.accessToken);
        
        // Salva refresh token in sessionStorage (sopravvive al reload)
        sessionStorage.setItem('refreshToken', response.data.refreshToken);
        
        // Salva user info
        sessionStorage.setItem('user', JSON.stringify({
          username: response.data.username,
          email: response.data.email,
          ruoli: response.data.ruoli
        }));
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    const token = this.getAccessToken();

    if (token) {
      try {
        // axiosInstance aggiunge il token automaticamente
        await axiosInstance.post('/api/auth/logout', {});
      } catch (error) {
        console.warn('Logout backend non riuscito:', error.message);
      }
    }

    this.clearAuth();
  }

  async refreshAccessToken() {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Per refresh usiamo il refreshToken nell'header
      const response = await axiosInstance.post(
        '/api/auth/refresh',
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } }
      );

      const newAccessToken = response.data.accessToken;
      this.setAccessToken(newAccessToken);

      return newAccessToken;
    } catch (error) {
      // Refresh fallito: logout forzato
      this.clearAuth();
      throw error;
    }
  }

  getCurrentUser() {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getAccessToken() {
    return this.accessToken || null;
  }

  getRefreshToken() {
    return sessionStorage.getItem('refreshToken');
  }

  setAccessToken(token) {
    this.accessToken = token;
  }

  isAuthenticated() {
    return !!this.getAccessToken() && !!this.getRefreshToken();
  }

  clearAuth() {
    this.accessToken = null;
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
  }

  handleError(error) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data;

      if (status === 401) {
        const backendMessage = typeof message === 'string'
          ? message
          : 'Credenziali non valide. Verifica username e password.';
        return new Error(backendMessage);
      } else if (status === 403) {
        return new Error('Accesso negato. Account non autorizzato.');
      } else if (status === 500) {
        return new Error('Errore del server. Riprova più tardi.');
      } else {
        return new Error(typeof message === 'string' ? message : 'Errore durante il login.');
      }
    } else if (error.request) {
      return new Error('Impossibile contattare il server. Verifica la connessione.');
    } else {
      return new Error('Errore durante la richiesta: ' + error.message);
    }
  }
}

export default new AuthService();