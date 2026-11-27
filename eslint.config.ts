import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// Matches a Tailwind class that uses square brackets (arbitrary value or variant).
const ARBITRARY_TAILWIND_VALUE = '/(^|[\\s:])[a-z-]*\\[/'

// Design tokens rule: only tokens defined in src/styles/tokens.css are allowed.
const tokenRestrictions = [
  {
    // w-[137px], bg-[#fff], [&>svg]:size-4, data-[state=open]:...
    selector: `JSXAttribute[name.name='className'] :matches(Literal, TemplateElement)[value=${ARBITRARY_TAILWIND_VALUE}]`,
    message:
      'Arbitrary Tailwind values are not allowed. Add a token to src/styles/tokens.css instead.',
  },
  {
    selector: `CallExpression[callee.name=/^(cva|clsx|cn|twMerge)$/] :matches(Literal, TemplateElement)[value=${ARBITRARY_TAILWIND_VALUE}]`,
    message:
      'Arbitrary Tailwind values are not allowed. Add a token to src/styles/tokens.css instead.',
  },
  {
    selector: 'Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
    message: 'Hard-coded colors are not allowed. Use a token from src/styles/tokens.css.',
  },
]

// Components rule: raw form controls may only exist inside the UI kit.
const rawControlRestriction = {
  selector: 'JSXOpeningElement[name.name=/^(button|input|select|textarea)$/]',
  message:
    'Do not use raw controls. Use a component from src/components/ui (Button, IconButton, Input, Select, Textarea, Chip).',
}

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'backend', 'src/services/generated'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    plugins: { 'react-refresh': reactRefresh },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-restricted-syntax': ['error', ...tokenRestrictions],
    },
  },
  {
    files: ['src/**/*.tsx'],
    ignores: ['src/components/ui/**', 'src/**/*.test.tsx'],
    rules: {
      'no-restricted-syntax': ['error', ...tokenRestrictions, rawControlRestriction],
    },
  },
  prettier,
)
