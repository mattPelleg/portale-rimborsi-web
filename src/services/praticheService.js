import axiosInstance from './axiosInstance';

class PraticheService {

  async visualizzaPratiche() {
    const response = await axiosInstance.get(
      `/pratica-service/visualizza-pratiche`
    );
    return response.data;
  }

  async visualizzaPratica(id) {
    const response = await axiosInstance.get(
      `/pratica-service/visualizza-pratica/${id}`
    );
    return response.data;
  }

  async aggiornaStatoPratica(praticaId, statoPratica) {
    const response = await axiosInstance.post(
      `/pratica-service/aggiorna-stato-pratica`,
      { praticaId, statoPratica }
    );
    return response.data;
  }

  async aggiornaDatiPratica(payload) {
    const response = await axiosInstance.post(
      `/pratica-service/aggiorna-dati-pratica`,
      payload
    );
    return response.data;
  }

  async visualizzaPraticheRecenti() {
    const response = await axiosInstance.get(
      `/pratica-service/visualizza-pratiche-recenti`
    );
    return response.data;
  }

}

export default new PraticheService();