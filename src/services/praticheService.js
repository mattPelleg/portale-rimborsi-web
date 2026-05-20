import axios from 'axios';
import authService from './authService';

const API_BASE_URL = '/portaleRimborsi-ws';

class PraticheService {

  getAuthHeader() {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async visualizzaPratiche() {
    const response = await axios.get(
      `${API_BASE_URL}/pratica-service/visualizza-pratiche`,
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async visualizzaPratica(id) {
    const response = await axios.get(
      `${API_BASE_URL}/pratica-service/visualizza-pratica/${id}`,
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async aggiornaStatoPratica(praticaId, statoPratica) {
    const response = await axios.post(
      `${API_BASE_URL}/pratica-service/aggiorna-stato-pratica`,
      { praticaId, statoPratica },
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  async aggiornaDatiPratica(payload) {
    const response = await axios.post(
      `${API_BASE_URL}/pratica-service/aggiorna-dati-pratica`,
      payload,
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

}

export default new PraticheService();