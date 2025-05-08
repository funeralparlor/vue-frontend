// src/services/CourseService.js

import api from './api';

export default {
  getAll(params = {}) {
    return api.get('/courses', { params });
  },
  
  getAllDropdown() {
    return api.get('/courses-all');
  },
  
  getById(id) {
    return api.get(`/courses/${id}`);
  },
  
  getByCollege(collegeId) {
    return api.get(`/colleges/${collegeId}/courses`);
  },
  
  create(data) {
    return api.post('/courses', data);
  },
  
  update(id, data) {
    return api.put(`/courses/${id}`, data);
  },
  
  delete(id) {
    return api.delete(`/courses/${id}`);
  },
  
  getTrash(params = {}) {
    return api.get('/courses-trash', { params });
  },
  
  restore(id) {
    return api.post(`/courses-restore/${id}`);
  },
  
  forceDelete(id) {
    return api.delete(`/courses-force-delete/${id}`);
  }
};