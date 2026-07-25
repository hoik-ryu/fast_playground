/**
 * lint-staged 설정 (별도 파일)
 *
 * 선택 이유:
 * - package.json보다 가독성·확장이 좋음 (함수형 태스크, 주석)
 * - Frontend 패키지 cwd 기준으로 ESLint/Prettier 설정을 그대로 사용
 * - Backend Ruff는 경로/OS 이슈를 피하기 위해 .husky/pre-commit에서 분리 처리
 */
export default {
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,css,scss,md,yml,yaml,html}': ['prettier --write'],
};
