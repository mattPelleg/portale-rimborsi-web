import axiosInstance from './axiosInstance';

class ClientiService {

  async visualizzaClienti() {
    const response = await axiosInstance.get(
      `/cliente-service/visualizza-clienti`
    );
    return response.data.listaClienti;
  }

  async inserisciCliente(datiCliente) {
    const response = await axiosInstance.post(
      `/cliente-service/inserisci-cliente`,
      { datiCliente }
    );
    return response.data;
  }
  
  async cercaCliente(cognome) {
    const response = await axiosInstance.post(
      `/cliente-service/cerca-cliente`,
      { cognome }
    );
    return response.data;
  }

  async visualizzaCliente(id) {
    const response = await axiosInstance.get(
      `/cliente-service/visualizza-cliente/${id}`
    );
    return response.data;
  }
}

export default new ClientiService();