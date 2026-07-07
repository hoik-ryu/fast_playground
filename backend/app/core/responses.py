from typing import Any

from app.schemas.common import ApiResponse, ErrorResponse


def format_validation_message(errors: list[dict[str, Any]]) -> str:
    parts: list[str] = []
    for err in errors:
        field = ".".join(
            str(part)
            for part in err.get("loc", ())
            if part not in ("body", "query", "path")
        )
        msg = err.get("msg", "유효하지 않은 값입니다.")
        if field:
            parts.append(f"{field}: {msg}")
        else:
            parts.append(msg)
    return "; ".join(parts) if parts else "입력값이 올바르지 않습니다."


def success_response(
    message: str = "Success",
    data=None,
):
    return ApiResponse(
        success=True,
        message=message,
        data=data,
    )


def error_response(
    message: str,
    error_code: str,
):
    return ErrorResponse(
        message=message,
        error_code=error_code,
    )
