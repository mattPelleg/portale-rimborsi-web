import axios from 'axios';

const API_BASE_URL = '/portaleRimborsi-ws/api';

class AuthService {

  async login(username, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password
      });

      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    const user = this.getCurrentUser();

    if (user?.token) {
      try {
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      } catch (error) {
        // Il logout locale avviene comunque anche se la chiamata al backend fallisce
        console.warn('Logout backend non riuscito:', error.message);
      }
    }

    this._clearLocalStorage();
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  getToken() {
    const user = this.getCurrentUser();
    return user?.token;
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  // Metodo privato per pulizia localStorage
  _clearLocalStorage() {
    localStorage.removeItem('user');
  }

  handleError(error) {
    if (error.response) {
      const status  = error.response.status;
      const message = error.response.data;

      if (status === 401) {
        // legge il messaggio dal backend se è una stringa, altrimenti fallback
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