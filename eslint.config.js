import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import importPlugin from 'eslint-plugin-import'
import boundaries from 'eslint-plugin-boundaries'

export default [
  {
    ignores: ['node_modules/**', '.next/**', 'dist/**', 'out/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      import: importPlugin,
      boundaries,
    },
    settings: {
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/*' },
        { type: 'components', pattern: 'src/components/*' },
        { type: 'services', pattern: 'src/services/*' },
        { type: 'lib', pattern: 'src/lib/*' },
        { type: 'hooks', pattern: 'src/hooks/*' },
        { type: 'types', pattern: 'src/types/*' },
      ],
      'boundaries/dependency-rules': [
        { from: 'app', allow: ['components', 'services', 'lib', 'hooks', 'types'] },
        { from: 'components', allow: ['components', 'lib', 'hooks', 'types'] },
        { from: 'services', allow: ['services', 'lib', 'types'] },
        { from: 'lib', allow: ['lib', 'types'] },
        { from: 'hooks', allow: ['services', 'lib', 'types'] },
      ],
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      'no-undef': 'off',

      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc' },
        },
      ],
      'import/no-cycle': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: ['../**/..'],
        },
      ],

      'boundaries/element-types': 'error',

      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
    },
  },
  {
    files: ['src/services/**/*.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
    },
  },
]
