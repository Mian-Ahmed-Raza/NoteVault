import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// ─── Request Interceptor ───────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('notevault_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ──────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const code = error.response?.data?.code;

    // Token issues → logout
    if (error.response?.status === 401) {
      if (code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN') {
        localStorage.removeItem('notevault_token');
        delete api.defaults.headers.common['Authorization'];
        window.location.href = '/auth';
      }
    }

    // Not verified → redirect to dashboard (VerifiedRoute will show VerifyRequired)
    if (error.response?.status === 403 && code === 'EMAIL_NOT_VERIFIED') {
      window.location.href = '/dashboard';
    }

    return Promise.reject(error);
  }
);

// ─── Notes API ─────────────────────────────────────────────────────
export const notesAPI = {
  getAll: (params) => api.get('/notes', { params }),
  getById: (id) => api.get(`/notes/${id}`),
  upload: (formData, onProgress) => api.post('/notes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
  }),
  download: (id) => api.get(`/notes/download/${id}`, { responseType: 'blob' }),
  delete: (id) => api.delete(`/notes/${id}`),
  getMyUploads: (params) => api.get('/notes/my-uploads', { params }),
  getDashboard: () => api.get('/notes/dashboard'),
  getSubjects: () => api.get('/notes/subjects'),
};

// ─── Auth API ──────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: () => api.post('/auth/resend-verification'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
};

export default api;