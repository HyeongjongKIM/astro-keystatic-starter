export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', ['admin', 'site']],
    'scope-empty': [0],
  },
};
