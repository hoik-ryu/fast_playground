import type { AxiosResponse } from 'axios';

import type { ApiResponse } from './types';

/**
 * ApiResponse 래퍼에서 data 필드를 꺼냅니다.
 * Response interceptor 는 unwrap 하지 않으며, API 함수에서만 사용합니다.
 */
export function getApiData<T>(response: AxiosResponse<ApiResponse<T>>): T {
  return response.data.data;
}

/**
 * ApiResponse 래퍼에서 message 필드를 꺼냅니다.
 */
export function getApiMessage(response: AxiosResponse<ApiResponse<unknown>>): string {
  return response.data.message;
}
