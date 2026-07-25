// 백엔드 app/schemas/user.py 와 형태를 맞춘 타입.

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

/** UserMeContext 별칭 */
export type UserContext = UserMeContext;
