/**
 * 브라우저 title · 브랜드 표시에 사용하는 앱 이름.
 * Single Source of Truth (런타임). index.html 은 %VITE_APP_NAME% 으로 동일 값을 사용합니다.
 */
const DEFAULT_APP_NAME = 'FastAPI Playground';

const configuredAppName = import.meta.env.VITE_APP_NAME?.trim();

export const APP_NAME = configuredAppName || DEFAULT_APP_NAME;
