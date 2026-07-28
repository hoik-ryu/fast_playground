import { Outlet } from 'react-router-dom';

import { AppShell } from './AppShell';

/**
 * Router Layout.
 * 라우팅 결합(Outlet)만 담당하고, 화면 레이아웃은 AppShell 에 위임합니다.
 */
export function RootLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
