class AppException(Exception):
    def __init__(
        self,
        message: str,
        error_code: str,
        status_code: int,
    ):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code


class UserNotFoundException(AppException):
    def __init__(self):
        super().__init__(
            message="사용자를 찾을 수 없습니다.",
            error_code="USER_NOT_FOUND",
            status_code=404,
        )


class InvalidCredentialsException(AppException):
    def __init__(self):
        super().__init__(
            message="이메일 또는 비밀번호가 올바르지 않습니다.",
            error_code="INVALID_CREDENTIALS",
            status_code=401,
        )


class ItemNotFoundException(AppException):
    def __init__(self):
        super().__init__(
            message="상품을 찾을 수 없습니다.",
            error_code="ITEM_NOT_FOUND",
            status_code=404,
        )


class ItemNameDuplicateException(AppException):
    def __init__(self):
        super().__init__(
            message="중복된 이름으로 저장할 수 없습니다.",
            error_code="ITEM_NAME_DUPLICATE",
            status_code=409,
        )
