import axios from 'axios';
import authService from './authService';

const API_BASE_URL = '/portaleRimborsi-ws';

const dashboardService = {
  
  getAuthHeader() {
    const token = localStorage.getItem('jwtToken');
    return {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  },

  /**
   * Recupera il summary della dashboard (clienti, moduli, pratiche, rimborsi)
   */
  async getSummary() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/dashboard-service/summary`,
        { headers: this.getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Errore nel recupero del summary dashboard:', error);
      throw error;
    }
  },

};

export default dashboardService;