import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// Matches a Tailwind class that uses square brackets (arbitrary value or variant).
const ARBITRARY_TAILWIND_VALUE = '/(^|[\\s:])[a-z-]*\\[/'

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'backend'] },
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
      // Design tokens rule: only tokens defined in src/styles/tokens.css are allowed.
      'no-restricted-syntax': [
        'error',
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
      ],
    },
  },
  prettier,
)
