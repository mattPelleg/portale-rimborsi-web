import axios from 'axios';
import authService from './authService';

const API_BASE_URL = '/portaleRimborsi-ws';

class ClientiService {

  getAuthHeader() {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async visualizzaClienti() {
    const response = await axios.get(
      `${API_BASE_URL}/cliente-service/visualizza-clienti`,
      { headers: this.getAuthHeader() }
    );
    return response.data.listaClienti;
  }

  async inserisciCliente(datiCliente) {
    const response = await axios.post(
      `${API_BASE_URL}/cliente-service/inserisci-cliente`,
      { datiCliente },
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }
}

export default new ClientiService();