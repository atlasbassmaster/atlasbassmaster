
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://34.59.16.167:3001',
  withCredentials: true // si vous utilisez des cookies
});

//// Intercepteur pour gérer les erreurs
//api.interceptors.response.use(
//  response => response,
//  error => {
//    if (error.response) {
//      return Promise.reject(error.response.data);
//    }
//    return Promise.reject(error);
//  }
//);

export default api;