import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { APP_NAME } from '@app/config/app';
import { type BreadcrumbItem, getBreadcrumbItems } from '@app/router/menu-utils';

function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.id} className="inline-flex items-center gap-1.5">
              {index > 0 ? (
                <span aria-hidden className="text-slate-300">
                  /
                </span>
              ) : null}
              {isLast ? (
                <span className="font-medium text-slate-700" aria-current="page">
                  {item.title}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="transition-colors hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded"
                >
                  {item.title}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Main 영역 Page Chrome.
 * MENU 기반 Breadcrumb 와 document.title 동기화만 담당합니다.
 * 화면 H1/H2 는 렌더하지 않습니다 (기존 Page 가 유지).
 */
export function PageChrome() {
  const { pathname } = useLocation();
  const breadcrumbItems = getBreadcrumbItems(pathname);
  const pageTitle = breadcrumbItems.at(-1)?.title;

  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} · ${APP_NAME}` : APP_NAME;
  }, [pageTitle]);

  return <Breadcrumb items={breadcrumbItems} />;
}
