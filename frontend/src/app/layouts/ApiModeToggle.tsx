import type { ApiMode } from '@shared/api/apiMode';
import { changeApiMode, getApiMode } from '@shared/api/apiMode';

const MODE_OPTIONS: { mode: ApiMode; label: string }[] = [
  { mode: 'dev', label: '개발 API' },
  { mode: 'real', label: '실제 API' },
];

/**
 * 개발 전용 API mode 전환 토글.
 * mode 변경 시 세션·캐시를 비우고 로그인 페이지로 이동합니다.
 */
export function ApiModeToggle() {
  const currentMode = getApiMode();

  const handleSelect = (mode: ApiMode) => {
    if (mode === currentMode) {
      return;
    }

    if (!confirm('API 대상을 변경하면 로그아웃되며 로그인 화면으로 이동합니다. 계속할까요?')) {
      return;
    }

    changeApiMode(mode);
  };

  return (
    <div
      className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5"
      role="group"
      aria-label="API 대상"
    >
      {MODE_OPTIONS.map(({ mode, label }) => {
        const pressed = currentMode === mode;

        return (
          <button
            key={mode}
            type="button"
            aria-pressed={pressed}
            onClick={() => handleSelect(mode)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${
              pressed ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
