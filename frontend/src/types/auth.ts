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

// GET /users/me 응답 data (백엔드 app/schemas/user.py UserMeResponse)
export interface Role {
  id: number;
  name: string;
}

export interface UserMe {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string | null;
  roles: Role[];
}

export interface UserMeUpdate {
  name: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface UserPermissions {
  manage_users: boolean;
  view_admin_stats: boolean;
}

export interface AdminStats {
  total_users: number;
}

export interface UserMeContext {
  profile: UserMe;
  permissions: UserPermissions;
  admin_stats: AdminStats | null;
}
