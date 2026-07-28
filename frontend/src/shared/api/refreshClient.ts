import axios from 'axios';

import { getCurrentApiBaseUrl } from './apiMode';
import { API_TIMEOUT_MS } from './httpConfig';

// refresh 요청 전용 — apiClient 인터셉터(401 재시도)를 타지 않도록 분리
// baseURL 은 request interceptor 에서 현재 API mode 기준으로 설정합니다.
export const refreshClient = axios.create({
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

refreshClient.interceptors.request.use((config) => {
  config.baseURL = getCurrentApiBaseUrl();
  return config;
});
