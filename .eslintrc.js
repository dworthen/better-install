module.exports = {
  extends: ['standard-with-typescript', 'eslint-config-prettier'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    '@typescript-eslint/space-before-function-paren': 'off',
  },
}
