import type { AxiosError } from "axios";
import type { ErrorResponse } from "../types/api";

/** 백엔드 AppException / error_response 의 message 추출 */
export function getApiErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const data = (err as AxiosError<ErrorResponse | { detail?: unknown }>)
      .response?.data;

    if (data && typeof data === "object" && "message" in data) {
      const message = (data as ErrorResponse).message;
      if (typeof message === "string" && message.trim()) {
        return message;
      }
    }

    const detail = (data as { detail?: unknown } | undefined)?.detail;
    if (detail) {
      return typeof detail === "string" ? detail : JSON.stringify(detail);
    }
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return "알 수 없는 오류가 발생했습니다.";
}
