from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UserResponse(BaseModel):
  id: int
  email: str
  name: str
  is_active: bool
  created_at: datetime | None = None

  model_config = ConfigDict(from_attributes=True)
