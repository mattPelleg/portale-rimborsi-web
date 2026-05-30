import axiosInstance from './axiosInstance';

class TipologicaService {

  async getStatiPratica() {
    const response = await axiosInstance.get(
      `/tipologica-service/stati-pratica`
    );
    return response.data;
  }

  async getStatiModulo() {
    const response = await axiosInstance.get(
      `/tipologica-service/stati-modulo`
    );
    return response.data;
  }

  async getDisservizi() {
    const response = await axiosInstance.get(
      `/tipologica-service/disservizi`
    );
    return response.data;
  }

  async getTipiCliente() {
    const response = await axiosInstance.get(
      `/tipologica-service/tipi-cliente`
    );
    return response.data;
  }
}

export default new TipologicaService();