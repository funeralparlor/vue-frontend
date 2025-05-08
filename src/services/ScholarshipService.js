// src/services/ScholarshipService.js
import api from './api';

export default {
  getAll(params = {}) {
    return api.get('/scholarships', { params });
  },
  
  getAllDropdown() {
    return api.get('/scholarships-all');
  },
  
  getById(id) {
    return api.get(`/scholarships/${id}`);
  },
  
  create(data) {
    return api.post('/scholarships', data);
  },
  
  update(id, data) {
    return api.put(`/scholarships/${id}`, data);
  },
  
  delete(id) {
    return api.delete(`/scholarships/${id}`);
  },
  
  getTrash(params = {}) {
    return api.get('/scholarships-trash', { params });
  },
  
  restore(id) {
    return api.post(`/scholarships-restore/${id}`);
  },
  
  forceDelete(id) {
    return api.delete(`/scholarships-force-delete/${id}`);
  }
};