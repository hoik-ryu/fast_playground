import type { AppIconName } from '@shared/ui/icon';

import { ROUTE_PATH } from './route-path';

/**
 * 메뉴에 연결할 아이콘. AppIcon 등록 이름만 허용합니다.
 * 아이콘이 없으면 null.
 */
export type MenuIconName = AppIconName | null;

/**
 * 앱 공통 메뉴 항목.
 * Header / Sidebar / Breadcrumb / 권한 필터가 동일한 MENU_CONFIG 를 사용합니다.
 *
 * Breadcrumb 는 breadcrumb 배열이 아니라 Menu Tree 를 탐색해 자동 생성합니다.
 * - showInBreadcrumb: 해당 노드를 breadcrumb 경로에 포함할지
 * - breadcrumbTitle: title 과 다른 라벨이 필요할 때만 지정 (없으면 title 사용)
 */
export interface MenuItem {
  id: string;
  title: string;
  path: string;
  icon: MenuIconName;
  showInHeader: boolean;
  showInSidebar: boolean;
  showInBreadcrumb: boolean;
  breadcrumbTitle?: string;
  children: MenuItem[];
  /** 접근 가능 role 이름 목록. 없으면 인증된 사용자 공통 메뉴로 간주 */
  roles?: string[];
}

/** 프로젝트 메뉴 단일 소스 (Single Source of Truth) */
export const MENU_CONFIG: MenuItem[] = [
  {
    id: 'items',
    title: 'Items',
    path: ROUTE_PATH.ITEMS,
    icon: null,
    showInHeader: true,
    showInSidebar: true,
    showInBreadcrumb: true,
    children: [],
  },
  {
    id: 'realtime',
    title: 'Realtime',
    path: ROUTE_PATH.REALTIME,
    icon: null,
    showInHeader: true,
    showInSidebar: true,
    showInBreadcrumb: true,
    children: [],
  },
];
