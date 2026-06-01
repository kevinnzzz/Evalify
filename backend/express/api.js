import axios from 'axios';

// Base Axios instance – points to Express backend for API calls
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor – attach JWT token
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('evalify_user');
    if (user) {
      try {
        const { token } = JSON.parse(user);
        if (token) config.headers.Authorization = `Bearer ${token}`;
      } catch (err) {
        console.error('Failed to parse user from localStorage:', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor – handle 401 (Unauthorized)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('evalify_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;

// ─── Auth Service ────────────────────────────────────────────────────────────

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

// ─── User Service ────────────────────────────────────────────────────────────

export const userService = {
  getActivity: () => api.get('/user/activity'),
  getStats: () => api.get('/user/stats'),
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  submitFeedback: (data) => api.post('/user/feedback', data),
};

// ─── CV Service ──────────────────────────────────────────────────────────────

export const cvService = {
  // ✅ Fetch roles dari Database (Express) - SOLUSI 2
  getJobsFromDatabase: () => api.get('/cv/jobs'),

  // (Old) Fetch roles dari Python API catalog - Fallback
  getCatalogRoles: () => api.get('/cv/catalog-roles'),

  review: (formData) =>
    api.post('/cv/review', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getReviews: () => api.get('/cv/reviews'),
  getReview: (id) => api.get(`/cv/reviews/${id}`),
};

// ─── Interview Service ───────────────────────────────────────────────────────

export const interviewService = {
  // Generate interview questions
  generateQuestions: (data) => api.post('/interview/questions', data),

  // ✅ PERBAIKAN: Generate TTS audio menggunakan JSON
  // Express gateway expects JSON body: { text, language }
  // Response type adalah 'blob' agar bisa langsung diplay dengan Audio API
  playTTS: (data) => {
    return api.post(
      '/interview/question-tts',
      {
        text: data.text,
        language: data.language || 'en',
      },
      {
        responseType: 'blob',
      },
    );
  },

  // Alternative: Generate TTS audio untuk satu pertanyaan (arraybuffer version)
  // Kirim sebagai multipart/form-data, response berupa binary WAV
  generateQuestionTTS: (data) => {
    const formData = new FormData();
    formData.append('text', data.text);
    formData.append('language', data.language || 'en');

    return api.post('/interview/question-tts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'arraybuffer',
    });
  },

  // Alias utama yang dipanggil frontend: interviewService.analyze(...)
  analyze: (formData) =>
    api.post('/interview/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300_000,
    }),

  // Alias lama – tetap ada untuk kompatibilitas
  analyzeAnswer: (formData) =>
    api.post('/interview/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300_000,
    }),

  // Riwayat sesi
  getSessions: () => api.get('/interview/sessions'),
  getSession: (id) => api.get(`/interview/sessions/${id}`),
};

// ─── Roles Service ───────────────────────────────────────────────────────────

export const rolesService = {
  getAllRoles: () => api.get('/roles'),
};
