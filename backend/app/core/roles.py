from app.models.user import User

USER_ROLE_NAME = "user"
MANAGER_ROLE_NAME = "manager"
ADMIN_ROLE_NAME = "admin"

DEFAULT_ROLE_NAMES = (
  USER_ROLE_NAME,
  MANAGER_ROLE_NAME,
  ADMIN_ROLE_NAME,
)


def user_has_role(user: User, role_name: str) -> bool:
  return any(role.name == role_name for role in user.roles)


def user_has_any_role(user: User, role_names: tuple[str, ...]) -> bool:
  return any(user_has_role(user, role_name) for role_name in role_names)
