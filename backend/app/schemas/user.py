from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class RoleResponse(BaseModel):
  id: int
  name: str

  model_config = ConfigDict(from_attributes=True)


class UserResponse(BaseModel):
  id: int
  email: str
  name: str
  is_active: bool
  created_at: datetime | None = None

  model_config = ConfigDict(from_attributes=True)


class UserMeResponse(UserResponse):
  roles: list[RoleResponse] = []


class UserMeUpdate(BaseModel):
  name: str = Field(min_length=1, max_length=100)


class ChangePasswordRequest(BaseModel):
  current_password: str = Field(min_length=1, max_length=100)
  new_password: str = Field(min_length=8, max_length=100)


class UserPermissions(BaseModel):
  """프론트 UI 분기·백엔드 권한 체크용 capability 플래그."""

  manage_users: bool = False
  view_admin_stats: bool = False


class AdminStatsResponse(BaseModel):
  total_users: int


class UserMeContextResponse(BaseModel):
  profile: UserMeResponse
  permissions: UserPermissions
  admin_stats: AdminStatsResponse | None = None
