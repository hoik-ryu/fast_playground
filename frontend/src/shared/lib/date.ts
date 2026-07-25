import 'dayjs/locale/ko';

import dayjs, { type ConfigType, type Dayjs } from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

/**
 * Sales.AX 날짜 표준 (Day.js)
 *
 * - 한국어 locale + relativeTime plugin
 * - timezone/UTC 강제 변환 없음 (로컬 해석 유지)
 * - 유효하지 않은 입력: format* 계열은 "-", isValidDate는 false,
 *   startOfDay/endOfDay는 유효한 값만 받고 아니면 null
 */

dayjs.extend(relativeTime);
dayjs.locale('ko');

export type DateInput = ConfigType;

const DATE_FORMAT = 'YYYY-MM-DD';
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm';

function toDayjs(value: DateInput): Dayjs | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
}

/** 입력이 Day.js로 파싱 가능한지 */
export function isValidDate(value: DateInput): boolean {
  return toDayjs(value) !== null;
}

/** 날짜만 표시 (기본: YYYY-MM-DD). 무효 시 "-" */
export function formatDate(value: DateInput, format: string = DATE_FORMAT): string {
  const parsed = toDayjs(value);
  return parsed ? parsed.format(format) : '-';
}

/** 날짜+시간 (기본: YYYY-MM-DD HH:mm). 무효 시 "-" */
export function formatDateTime(value: DateInput, format: string = DATETIME_FORMAT): string {
  const parsed = toDayjs(value);
  return parsed ? parsed.format(format) : '-';
}

/** 상대 시간 (예: 3분 전). 무효 시 "-" */
export function formatRelativeTime(value: DateInput): string {
  const parsed = toDayjs(value);
  return parsed ? parsed.fromNow() : '-';
}

/** 해당 일 00:00:00.000. 무효 입력 시 null */
export function startOfDay(value: DateInput): Dayjs | null {
  const parsed = toDayjs(value);
  return parsed ? parsed.startOf('day') : null;
}

/** 해당 일 23:59:59.999. 무효 입력 시 null */
export function endOfDay(value: DateInput): Dayjs | null {
  const parsed = toDayjs(value);
  return parsed ? parsed.endOf('day') : null;
}

export { dayjs };
