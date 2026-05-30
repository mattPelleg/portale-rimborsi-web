import axiosInstance from './axiosInstance';

class DashboardService {

  /**
   * Recupera il summary della dashboard (clienti, moduli, pratiche, rimborsi)
   */
  async getSummary() {
    try {
      const response = await axiosInstance.get(
        `/dashboard-service/summary`
      );
      return response.data;
    } catch (error) {
      console.error('Errore nel recupero del summary dashboard:', error);
      throw error;
    }
  }

  async getPraticheRecenti() {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/pratica-service/visualizza-pratiche-recenti`
    );
    return response.data;
  }

  async getModuliInSospeso() {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/modulo-service/visualizza-moduli-recenti`
    );
    return response.data;
  }

}

export default new DashboardService();