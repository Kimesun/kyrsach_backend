import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем слеш в конец URL для всех запросов, кроме тех, что содержат ID
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Добавляем слеш в конец URL, если его нет и это не запрос с параметром
  if (config.url && !config.url.endsWith('/') && !config.url.match(/\/\d+$/)) {
    config.url = config.url + '/';
  }
  
  return config;
});

// Обработка 401 ошибки
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;