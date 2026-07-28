import type { ReactNode } from 'react';

export type PageHeaderProps = {
  /** 페이지 제목 (항상 h1) */
  title: string;
  /** 제목 아래 보조 설명 */
  description?: string;
  /** 우측(Desktop) / 하단(Mobile) Action 영역 */
  children?: ReactNode;
};

/**
 * Content 영역 페이지 헤더.
 * Title / Description / Action 만 담당합니다.
 * Breadcrumb · document.title · App Header 와는 무관합니다.
 */
export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>

      {children ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>
      ) : null}
    </div>
  );
}
