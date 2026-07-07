// 백엔드 app/schemas/common.py 의 ApiResponse 와 형태를 맞춘 타입.

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error_code: string;
}
