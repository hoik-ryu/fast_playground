import { NavLink } from 'react-router-dom';

import { getSidebarMenuItems } from '@app/router/menu-utils';
import { AppIcon } from '@shared/ui/icon';

const sidebarItems = getSidebarMenuItems();

/**
 * AppShell 전용 Sidebar (Desktop).
 * menu-utils 가 반환한 메뉴로 Application Navigation 을 담당합니다.
 * 모바일에서는 숨기며, Header 모바일 Navigation 이 그 역할을 유지합니다.
 */
export function Sidebar() {
  return (
    <aside
      className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-56 shrink-0 overflow-y-auto border-r border-slate-200/80 bg-white lg:block"
      aria-label="사이드바"
    >
      <nav className="flex flex-col gap-1 p-3" aria-label="사이드 메뉴">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            {item.icon ? <AppIcon name={item.icon} /> : null}
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
