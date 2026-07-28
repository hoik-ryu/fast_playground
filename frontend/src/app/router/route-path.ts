/** 앱에서 사용하는 라우트 경로 상수. 문자열 하드코딩을 줄이기 위해 한곳에서 관리합니다. */
export const ROUTE_PATH = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ITEMS: '/items',
  ME: '/me',
  ME_PASSWORD: '/me/password',
  REALTIME: '/realtime',
  DEV_UI_SHOWCASE: '/dev/ui-showcase',
} as const;
