import axios from 'axios';
import authService from './authService';

const API_BASE_URL = '/portaleRimborsi-ws';

class ModuliService {

  getAuthHeader() {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async visualizzaModuli() {
    const response = await axios.get(
      `${API_BASE_URL}/modulo-service/visualizza-moduli`,
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async inserisciModulo(datiModulo) {
    const response = await axios.post(
      `${API_BASE_URL}/modulo-service/inserisci-modulo`,
      { datiModulo },
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async visualizzaModulo(id) {
    const response = await axios.get(
      `${API_BASE_URL}/modulo-service/visualizza-modulo/${id}`,
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async approvaModulo(id) {
    const response = await axios.post(
      `${API_BASE_URL}/modulo-service/approva-modulo`,
      { moduloId: id },
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async respingiModulo(id, motivoRespinto) {
    const response = await axios.post(
      `${API_BASE_URL}/modulo-service/respingi-modulo`,
      { moduloId: id, motivoRespinto },
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async visualizzaModuliRecenti() {
    const response = await axios.get(
      `${API_BASE_URL}/modulo-service/visualizza-moduli-recenti`,
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }
}

export default new ModuliService();