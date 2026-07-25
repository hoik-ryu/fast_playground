import type { LucideProps } from 'lucide-react';

import { type AppIconName, iconMap } from './iconMap';

const DEFAULT_SIZE = 16;
const DEFAULT_STROKE = 1.75;

export type AppIconProps = Omit<LucideProps, 'ref'> & {
  name: AppIconName;
  /** true면 장식용(aria-hidden). false면 의미 있는 아이콘(title/aria-label 권장) */
  decorative?: boolean;
  title?: string;
};

/**
 * Sales.AX 표준 아이콘.
 * iconMap에 등록된 이름만 사용할 수 있습니다.
 */
export function AppIcon({
  name,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
  decorative = true,
  title,
  className,
  ...props
}: AppIconProps) {
  const Icon = iconMap[name];

  return (
    <Icon
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : 'img'}
      aria-label={!decorative ? title : undefined}
      {...props}
    />
  );
}
