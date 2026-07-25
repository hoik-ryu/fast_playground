import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';

import type { AxiosError } from 'axios';

import type { ErrorResponse } from '@shared/api/types';

/**
 * FastAPI / 앱 공통 에러에서 필드 단위 메시지를 추출하기 위한 확장 가능한 형태.
 *
 * 현재:
 * - ErrorResponse.message 가 "email: ...; password: ..." 형태일 수 있음
 * - FastAPI 기본 detail 배열이 그대로 올 수도 있음 (향후)
 *
 * 향후:
 * - field_errors: Record<string, string | string[]>
 * - details: [{ loc: [...], msg: string }]
 */
export type ServerFieldErrors = Partial<Record<string, string>>;

type ValidationDetailItem = {
  loc?: unknown[];
  msg?: string;
  message?: string;
};

type ServerErrorBody = ErrorResponse & {
  field_errors?: Record<string, string | string[]>;
  details?: ValidationDetailItem[];
  detail?: unknown;
};

function firstString(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string' && value.trim()) return value;
  if (Array.isArray(value)) {
    const hit = value.find((v) => typeof v === 'string' && v.trim());
    return hit;
  }
  return undefined;
}

function locToField(loc: unknown[] | undefined): string | null {
  if (!loc?.length) return null;
  const parts = loc
    .filter((part) => part !== 'body' && part !== 'query' && part !== 'path')
    .map(String);
  return parts.length ? parts.join('.') : null;
}

/** "email: msg; password: msg" → { email, password } */
function parseDelimitedMessage(message: string): ServerFieldErrors {
  const result: ServerFieldErrors = {};
  for (const part of message.split(';')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const sep = trimmed.indexOf(':');
    if (sep <= 0) continue;
    const field = trimmed.slice(0, sep).trim();
    const msg = trimmed.slice(sep + 1).trim();
    if (field && msg && !result[field]) {
      result[field] = msg;
    }
  }
  return result;
}

function fromFieldErrors(fieldErrors: Record<string, string | string[]>): ServerFieldErrors {
  const result: ServerFieldErrors = {};
  for (const [key, value] of Object.entries(fieldErrors)) {
    const msg = firstString(value);
    if (msg) result[key] = msg;
  }
  return result;
}

function fromDetails(details: ValidationDetailItem[]): ServerFieldErrors {
  const result: ServerFieldErrors = {};
  for (const item of details) {
    const field = locToField(item.loc);
    const msg = item.msg ?? item.message;
    if (field && msg && !result[field]) {
      result[field] = msg;
    }
  }
  return result;
}

function fromDetailUnknown(detail: unknown): ServerFieldErrors {
  if (!Array.isArray(detail)) return {};
  return fromDetails(detail as ValidationDetailItem[]);
}

/**
 * 다양한 서버 에러 페이로드에서 필드 에러 맵을 추출합니다.
 * 매핑할 필드가 없으면 빈 객체를 반환합니다 (그 경우 toast 등 전역 처리).
 */
export function extractServerFieldErrors(error: unknown): ServerFieldErrors {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return {};
  }

  const data = (error as AxiosError<ServerErrorBody>).response?.data;
  if (!data || typeof data !== 'object') {
    return {};
  }

  if (data.field_errors && typeof data.field_errors === 'object') {
    const mapped = fromFieldErrors(data.field_errors);
    if (Object.keys(mapped).length) return mapped;
  }

  if (Array.isArray(data.details)) {
    const mapped = fromDetails(data.details);
    if (Object.keys(mapped).length) return mapped;
  }

  if (data.detail !== undefined) {
    const mapped = fromDetailUnknown(data.detail);
    if (Object.keys(mapped).length) return mapped;
  }

  if (typeof data.message === 'string' && data.message.includes(':')) {
    return parseDelimitedMessage(data.message);
  }

  return {};
}

export function isValidationError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return false;
  }
  const axiosError = error as AxiosError<ServerErrorBody>;
  const status = axiosError.response?.status;
  const code = axiosError.response?.data?.error_code;
  return status === 422 || code === 'VALIDATION_ERROR';
}

/**
 * 서버 필드 에러를 React Hook Form setError 로 연결합니다.
 * @returns 하나 이상 필드에 매핑되었으면 true
 */
export function mapServerErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  options?: {
    /** 서버 필드명 → 폼 필드명 별칭 (예: newPassword ← new_password) */
    fieldMap?: Partial<Record<string, FieldPath<TFieldValues>>>;
  },
): boolean {
  const fieldErrors = extractServerFieldErrors(error);
  const entries = Object.entries(fieldErrors);
  if (!entries.length) return false;

  let mapped = false;
  for (const [serverField, message] of entries) {
    const formField = (options?.fieldMap?.[serverField] ?? serverField) as FieldPath<TFieldValues>;
    setError(formField, { type: 'server', message });
    mapped = true;
  }
  return mapped;
}
