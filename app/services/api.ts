import axios from 'axios';
import { Platform } from 'react-native';

// For web, we use a relative path so it works seamlessly on HF Spaces or any domain.
// For native (iOS/Android), it falls back to the absolute URL in .env
const API_URL = Platform.OS === 'web' && typeof window !== 'undefined'
  ? '/api/'
  : process.env.EXPO_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);
