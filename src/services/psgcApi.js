// src/services/psgcApi.js
import api from './api';

/**
 * Service for fetching Philippine Standard Geographic Code (PSGC) data
 */
const psgcApi = {
  /**
   * Fetch all provinces
   * @returns {Promise} Promise resolving to array of provinces
   */
  getProvinces: async () => {
    try {
      const response = await api.get('/psgc/provinces');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch provinces:', error);
      throw error;
    }
  },

  /**
   * Fetch municipalities/cities by province code
   * @param {string} provinceCode - The PSGC code of the province
   * @returns {Promise} Promise resolving to array of municipalities/cities
   */
  getCitiesByProvince: async (provinceCode) => {
    try {
      const response = await api.get(`/psgc/cities/${provinceCode}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch cities/municipalities:', error);
      throw error;
    }
  },

  /**
   * Fetch barangays by municipality/city code
   * @param {string} cityCode - The PSGC code of the municipality/city
   * @returns {Promise} Promise resolving to array of barangays
   */
  getBarangaysByCity: async (cityCode) => {
    try {
      const response = await api.get(`/psgc/barangays/${cityCode}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch barangays:', error);
      throw error;
    }
  }
};

export default psgcApi;