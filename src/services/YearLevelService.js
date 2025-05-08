// src/services/yearlvelservice.js
import api from './api';

export default {
  getAll(params = {}) {
    return api.get('/year_levels', { params });
  },
  
  getAllDropdown() {
    return api.get('/year_levels-all');
  },
  
  getById(id) {
    return api.get(`/year_levels/${id}`);
  },
  
  create(data) {
    return api.post('/year_levels', data);
  },
  
  update(id, data) {
    return api.put(`/year_levels/${id}`, data);
  },
  
  delete(id) {
    return api.delete(`/year_levels/${id}`);
  },
  
  getTrash(params = {}) {
    return api.get('/year_levels-trash', { params });
  },
  
  restore(id) {
    return api.post(`/year_levels-restore/${id}`);
  },
  
  forceDelete(id) {
    return api.delete(`/year_levels-force-delete/${id}`);
  }
};