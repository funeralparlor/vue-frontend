// Example template for creating a service for any option type
// src/services/OptionService.js (replace "Option" with the actual option name)

import api from './api';

export default {
  getAll(params = {}) {
    return api.get('/colleges', { params }); // Replace 'options' with the actual endpoint
  },
  
  getAllDropdown() {
    return api.get('/colleges-all'); // Replace 'options-all' with the actual endpoint
  },
  
  getById(id) {
    return api.get(`/colleges/${id}`); // Replace 'options' with the actual endpoint
  },
  
  create(data) {
    return api.post('/colleges', data); // Replace 'options' with the actual endpoint
  },
  
  update(id, data) {
    return api.put(`/colleges/${id}`, data); // Replace 'options' with the actual endpoint
  },
  
  delete(id) {
    return api.delete(`/colleges/${id}`); // Replace 'options' with the actual endpoint
  },
  
  getTrash(params = {}) {
    return api.get('/colleges-trash', { params }); // Replace 'options-trash' with the actual endpoint
  },
  
  restore(id) {
    return api.post(`/colleges-restore/${id}`); // Replace 'options-restore' with the actual endpoint
  },
  
  forceDelete(id) {
    return api.delete(`/colleges-force-delete/${id}`); // Replace 'options-force-delete' with the actual endpoint
  }
};