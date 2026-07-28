import { MENU_CONFIG, type MenuItem } from './menu';

/**
 * URL pathname 정규화.
 * 루트(`/`)는 유지하고, 그 외 trailing slash 만 제거합니다.
 */
function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

/** Header 에 표시할 최상위 메뉴 (`showInHeader`) */
export function getHeaderMenuItems(): MenuItem[] {
  return MENU_CONFIG.filter((item) => item.showInHeader);
}

/** Sidebar 에 표시할 최상위 메뉴 (`showInSidebar`) */
export function getSidebarMenuItems(): MenuItem[] {
  return MENU_CONFIG.filter((item) => item.showInSidebar);
}

/**
 * pathname 에 일치하는 메뉴까지의 ancestor chain 을 DFS 로 반환합니다.
 * 일치하지 않으면 빈 배열.
 * startsWith 는 사용하지 않으며, 정규화 후 exact match 만 허용합니다.
 */
export function findMenuPathByPathname(pathname: string): MenuItem[] {
  const target = normalizePathname(pathname);

  function dfs(items: MenuItem[], ancestors: MenuItem[]): MenuItem[] | null {
    for (const item of items) {
      const chain = [...ancestors, item];

      if (normalizePathname(item.path) === target) {
        return chain;
      }

      const children = item.children ?? [];
      if (children.length > 0) {
        const found = dfs(children, chain);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  return dfs(MENU_CONFIG, []) ?? [];
}

/** Breadcrumb UI 에 사용하는 표시용 항목 */
export type BreadcrumbItem = {
  id: string;
  title: string;
  path: string;
};

/**
 * pathname 에 대응하는 Breadcrumb 항목.
 * showInBreadcrumb 만 포함하고, 라벨은 breadcrumbTitle ?? title.
 * 매칭 없거나 표시 항목이 없으면 빈 배열.
 */
export function getBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  return findMenuPathByPathname(pathname)
    .filter((item) => item.showInBreadcrumb)
    .map((item) => ({
      id: item.id,
      title: item.breadcrumbTitle ?? item.title,
      path: item.path,
    }));
}
