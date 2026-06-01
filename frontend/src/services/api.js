import axios from 'axios';
import { mockRoles } from '../data/mockData';

const API_BASE = import.meta.env.VITE_API_GATEWAY || 'http://localhost:3000';

// Base Axios instance
const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor – attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('evalify_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor – handle 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('evalify_user');
      localStorage.removeItem('evalify_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;

// ─── Auth Service ──────────────────────────────────────────────────────────────
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// ─── CV Service ───────────────────────────────────────────────────────────────
export const cvService = {
  review: (formData) => api.post('/cv/review', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getReviews: () => api.get('/cv/reviews'),
  getReview: (id) => api.get(`/cv/reviews/${id}`),
  getJobsFromDatabase: () => api.get('/cv/jobs'),
};

// ─── Interview Service ────────────────────────────────────────────────────────
export const interviewService = {
  generateQuestions: (data) => api.post('/interview/questions', data),
  questionTTS: (data) => api.post('/interview/question-tts', data),
  playTTS: (data) => api.post('/interview/question-tts', data, { responseType: 'blob' }),
  analyzeSession: (formData) =>
    api.post('/interview/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    }),  // Alias untuk compatibility dengan frontend
  analyze: (formData) =>
    api.post('/interview/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    }),  getSessions: () => api.get('/interview/sessions'),
  getSession: (id) => api.get(`/interview/sessions/${id}`),
};

// ─── User / Dashboard Service ─────────────────────────────────────────────────
export const userService = {
  getDashboardData: () => api.get('/user/dashboard-data'),
  getStats: () => api.get('/user/stats'),
  getActivity: (limit = 10) => api.get(`/user/activity?limit=${limit}`),
  getProfile: () => api.get('/user/profile'),
  getInterviews: () => api.get('/user/interviews'),
  getCVReviews: () => api.get('/user/cv-reviews'),
  logCVReview: (data) => api.post('/user/log-cv-review', data),
  logInterview: (data) => api.post('/user/log-interview', data),
};

// ─── Roles Service ────────────────────────────────────────────────────────────
export const rolesService = {
  getAllRoles: () => Promise.resolve({ data: mockRoles }),
};
