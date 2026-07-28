import type { ReactNode } from 'react';

import { Header } from './Header';
import { PageChrome } from './PageChrome';
import { Sidebar } from './Sidebar';

type AppShellProps = {
  children: ReactNode;
};

/**
 * Application UI Layout (App Shell).
 *
 * Header / Sidebar / Main 을 배치하고 children 을 렌더합니다.
 * Router(Outlet) · 인증 · 메뉴 로직에 의존하지 않습니다.
 * Breadcrumb / document.title 은 PageChrome 이 담당합니다.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <PageChrome />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
