// 백엔드 app/schemas/auth.py 와 형태를 맞춘 타입.

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface RegisterUserData {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// POST /auth/login 응답 data (백엔드 snake_case)
export interface LoginTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
