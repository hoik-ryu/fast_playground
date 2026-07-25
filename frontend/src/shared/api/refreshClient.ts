import axios from 'axios';

// refresh 요청 전용 — apiClient 인터셉터(401 재시도)를 타지 않도록 분리
export const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});
