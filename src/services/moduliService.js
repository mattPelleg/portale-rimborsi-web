import axiosInstance from './axiosInstance';

class ModuliService {

  async visualizzaModuli() {
    const response = await axiosInstance.get(
      `/modulo-service/visualizza-moduli`
    );
    return response.data;
  }

  async inserisciModulo(datiModulo) {
    const response = await axiosInstance.post(
      `/modulo-service/inserisci-modulo`,
      { datiModulo }
    );
    return response.data;
  }

  async visualizzaModulo(id) {
    const response = await axiosInstance.get(
      `/modulo-service/visualizza-modulo/${id}`
    );
    return response.data;
  }

  async approvaModulo(id) {
    const response = await axiosInstance.post(
      `/modulo-service/approva-modulo`,
      { moduloId: id }
    );
    return response.data;
  }

  async respingiModulo(id, motivoRespinto) {
    const response = await axiosInstance.post(
      `/modulo-service/respingi-modulo`,
      { moduloId: id, motivoRespinto }
    );
    return response.data;
  }

  async visualizzaModuliRecenti() {
    const response = await axiosInstance.get(
      `/modulo-service/visualizza-moduli-recenti`
    );
    return response.data;
  }
}

export default new ModuliService();