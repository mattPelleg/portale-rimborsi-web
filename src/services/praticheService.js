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
}

export default new PraticheService();