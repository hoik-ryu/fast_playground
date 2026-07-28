import { LoadingSpinner } from './LoadingSpinner';

export type LoadingFallbackProps = {
  /** 스피너 아래 표시할 문구. 기본값은 '불러오는 중...' 입니다. */
  message?: string;
  /**
   * true 면 뷰포트 높이를 채우는 중앙 정렬 영역으로 표시합니다.
   * 전역 backdrop/overlay 가 아니라 콘텐츠 영역 fallback 입니다.
   */
  fullScreen?: boolean;
  /** 루트 요소에 추가할 클래스. */
  className?: string;
};

/**
 * Suspense fallback 이나 페이지 영역 로딩에 사용하는 공통 콘텐츠 fallback.
 * 전역 Overlay 가 아니라 해당 영역만 채우는 단순 로딩 표시입니다.
 */
export function LoadingFallback({
  message = '불러오는 중...',
  fullScreen = false,
  className,
}: LoadingFallbackProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 px-4 py-10 text-center text-sm text-slate-500${
        fullScreen ? ' min-h-screen' : ''
      }${className ? ` ${className}` : ''}`}
    >
      <LoadingSpinner label={message} />
      <p>{message}</p>
    </div>
  );
}
