// src/services/CampusService.js
import api from './api';

export default {
  getAll(params = {}) {
    return api.get('/campuses', { params });
  },
  
  getAllDropdown() {
    return api.get('/campuses-all');
  },
  
  getById(id) {
    return api.get(`/campuses/${id}`);
  },
  
  create(data) {
    return api.post('/campuses', data);
  },
  
  update(id, data) {
    return api.put(`/campuses/${id}`, data);
  },
  
  delete(id) {
    return api.delete(`/campuses/${id}`);
  },
  
  getTrash(params = {}) {
    return api.get('/campuses-trash', { params });
  },
  
  restore(id) {
    return api.post(`/campuses-restore/${id}`);
  },
  
  forceDelete(id) {
    return api.delete(`/campuses-force-delete/${id}`);
  }
};