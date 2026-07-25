import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Bell,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronDown,
  GitBranch,
  Home,
  LogOut,
  Settings,
  Target,
  User,
  Users,
} from 'lucide-react';

/**
 * 제품에서 허용하는 아이콘만 명시적으로 등록합니다.
 * Lucide 전체를 동적으로 로드하지 마세요.
 */
export const iconMap = {
  home: Home,
  calendar: Calendar,
  opportunity: Target,
  progress: GitBranch,
  result: CheckCircle2,
  customer: Users,
  performance: BarChart3,
  notification: Bell,
  settings: Settings,
  logout: LogOut,
  user: User,
  briefcase: Briefcase,
  chevronDown: ChevronDown,
} as const satisfies Record<string, LucideIcon>;

export type AppIconName = keyof typeof iconMap;
