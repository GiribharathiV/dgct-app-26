
export const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-api.onrender.com/api'  // Replace with your actual backend URL
  : 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
  },
  students: {
    list: '/students',
    create: '/students',
    delete: (id: string) => `/students/${id}`,
  },
  assessments: {
    list: '/assessments',
    create: '/assessments',
    delete: (id: string) => `/assessments/${id}`,
  },
};
