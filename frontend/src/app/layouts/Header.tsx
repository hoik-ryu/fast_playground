import { NavLink } from 'react-router-dom';

import { APP_NAME } from '@app/config/app';
import { getHeaderMenuItems } from '@app/router/menu-utils';
import { ProfileMenu, useAuth } from '@features/auth';
import { useCurrentUser } from '@entities/user';

import { ApiModeToggle } from './ApiModeToggle';

const headerNavItems = getHeaderMenuItems();

/**
 * AppShell 전용 Header.
 * menu-utils 가 반환한 메뉴로 Navigation 과 인증/사용자 영역을 담당합니다.
 */
export function Header() {
  const { isAuthenticated } = useAuth();
  const { user } = useCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <NavLink to="/" className="text-base font-bold tracking-tight text-slate-900">
          {APP_NAME}
        </NavLink>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="주요 메뉴">
          {headerNavItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {item.title}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {import.meta.env.DEV ? <ApiModeToggle /> : null}

          {isAuthenticated && user ? (
            <ProfileMenu user={user} />
          ) : (
            <NavLink
              to="/login"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              로그인
            </NavLink>
          )}
        </div>
      </div>

      <nav
        className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 sm:hidden"
        aria-label="모바일 주요 메뉴"
      >
        {headerNavItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
              }`
            }
          >
            {item.title}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
