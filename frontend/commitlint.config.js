/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // type(scope): summary 필수
    'type-empty': [2, 'never'],
    'scope-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'header-max-length': [2, 'always', 100],
    // 한 줄 커밋 금지 — body 필수
    'body-empty': [2, 'never'],
    // body와 header 사이 빈 줄
    'body-leading-blank': [2, 'always'],
    // FSD, JWT, API 등 약어·고유명사 대문자 허용
    'subject-case': [0],
  },
};
