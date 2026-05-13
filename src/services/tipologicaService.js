import axios from 'axios';
import authService from './authService';

const API_BASE_URL = '/portaleRimborsi-ws';

class TipologicaService {

  getAuthHeader() {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getStatiPratica() {
    const response = await axios.get(
      `${API_BASE_URL}/tipologica-service/stati-pratica`,
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async getStatiModulo() {
    const response = await axios.get(
      `${API_BASE_URL}/tipologica-service/stati-modulo`,
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async getDisservizi() {
    const response = await axios.get(
      `${API_BASE_URL}/tipologica-service/disservizi`,
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async getTipiCliente() {
    const response = await axios.get(
      `${API_BASE_URL}/tipologica-service/tipi-cliente`,
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }
}

export default new TipologicaService();