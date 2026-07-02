import axios from "axios";

// 모든 API 요청이 거치는 공용 axios 인스턴스.
// baseURL 은 .env 의 VITE_API_BASE_URL 로 관리합니다.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// 로그인 붙일 준비: 토큰이 저장돼 있으면 Authorization 헤더를 자동으로 실어 보냅니다.
// 실제 로그인 API가 생기면 auth/auth.ts 에서 토큰을 저장하기만 하면 됩니다.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 이 오면(추후 인증 붙였을 때) 로그인 페이지로 보낼 수 있는 자리.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      // 필요 시 여기서 window.location 이동 처리
    }
    return Promise.reject(error);
  },
);
