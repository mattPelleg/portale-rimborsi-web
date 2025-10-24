import axios from 'axios';

const API_BASE_URL = 'http://localhost:8086/portaleRimborsi-ws/api';

class AuthService {
  async login(username, password) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password
      });
      
      if (response.data.token) {
        // Salva il token e i dati utente nel localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  logout() {
    localStorage.removeItem('user');
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

  handleError(error) {
    if (error.response) {
      // Il server ha risposto con un codice di stato diverso da 2xx
      const status = error.response.status;
      const message = error.response.data;
      
      if (status === 401) {
        return new Error('Credenziali non valide. Verifica username e password.');
      } else if (status === 403) {
        return new Error('Accesso negato. Account non autorizzato.');
      } else if (status === 500) {
        return new Error('Errore del server. Riprova più tardi.');
      } else {
        return new Error(message || 'Errore durante il login.');
      }
    } else if (error.request) {
      // La richiesta è stata fatta ma non è arrivata risposta
      return new Error('Impossibile contattare il server. Verifica la connessione.');
    } else {
      // Errore nella configurazione della richiesta
      return new Error('Errore durante la richiesta: ' + error.message);
    }
  }
}

export default new AuthService();