import api from './api';

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me')
};

export const studentService = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  updateProfile: (data) => api.put('/students/profile/update', data),
  changePassword: (data) => api.put('/students/profile/password', data),
  updateFace: (data) => api.put('/students/profile/face', data)
};

export const subjectService = {
  getAll: () => api.get('/subjects'),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`)
};

export const examService = {
  getAll: (params) => api.get('/exams', { params }),
  getById: (id) => api.get(`/exams/${id}`),
  getAvailable: () => api.get('/exams/available'),
  create: (data) => api.post('/exams', data),
  createFromQuestionBank: (data) => api.post('/exams/create-from-question-bank', data),
  update: (id, data) => api.put(`/exams/${id}`, data),
  delete: (id) => api.delete(`/exams/${id}`),
  startExam: (id) => api.post(`/exams/${id}/start`),
  submitExam: (attemptId, data) => api.post(`/exams/${attemptId}/submit`, data),
  submitAdaptiveAnswer: (attemptId, data) => api.post(`/exams/${attemptId}/adaptive-submit`, data),
  recordViolation: (attemptId, data) => api.post(`/exams/${attemptId}/violation`, data),
  parsePdf: (formData) => api.post('/exams/parse-pdf', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  createFromJson: (data) => api.post('/exams/create-from-json', data)
};

export const questionService = {
  getByExamId: (examId) => api.get(`/questions/${examId}`),
  create: (data) => api.post('/questions', data),
  bulkCreate: (data) => api.post('/questions/bulk', data),
  update: (id, data) => api.put(`/questions/${id}`, data),
  delete: (id) => api.delete(`/questions/${id}`)
};

export const resultService = {
  getAll: (params) => api.get('/results', { params }),
  getMyResults: () => api.get('/results/my-results'),
  getByStudentId: (id) => api.get(`/results/student/${id}`),
  getDetails: (attemptId) => api.get(`/results/details/${attemptId}`),
  getStats: () => api.get('/results/stats'),
  getSubjectPerformance: () => api.get('/results/subject-performance'),
  getMonthlyStats: () => api.get('/results/monthly-stats'),
  getLeaderboard: (params) => api.get('/results/leaderboard', { params })
};

export const dashboardService = {
  getAdminStats: () => api.get('/dashboard/admin'),
  getStudentStats: () => api.get('/dashboard/student')
};

export const reportService = {
  downloadPDF: (attemptId) => api.get(`/reports/pdf/${attemptId}`, { responseType: 'blob' }),
  downloadMyPDF: (examId) => api.get(`/reports/my-pdf/${examId}`, { responseType: 'blob' }),
  exportExcel: () => api.get('/reports/excel', { responseType: 'blob' })
};
