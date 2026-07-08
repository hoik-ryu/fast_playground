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
}
