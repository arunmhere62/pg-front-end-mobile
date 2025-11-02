# Setup Instructions - Type Checking & Path Aliases

## ✅ Completed Changes

### 1. TypeScript Type Checking (Prestart Hook)
- Added `typecheck` script to package.json
- Added `prestart` hook that runs type checking before `npm start`
- This ensures all type errors are caught before running the app

### 2. Babel Module Resolver (Path Aliases)
- Updated `babel.config.js` to support `@` alias for `./src`
- This allows imports like `@/services/payments/paymentService`

### 3. Fixed All Type Errors
Fixed 5 type errors across 2 files:

#### paymentSlice.ts
- Fixed "required parameter cannot follow optional parameter" error
- Changed `params?:` to `params: {...} = {}` with default value

#### ImageUploadS3.tsx
- Fixed image style type incompatibility by adding `as const`
- Fixed color type errors by using proper nested Theme.colors paths:
  - `Theme.colors.text` → `Theme.colors.text.primary`
  - `Theme.colors.background` → `Theme.colors.background.primary`
  - `Theme.colors.backgroundSecondary` → `Theme.colors.background.secondary`

#### DashboardScreen.tsx
- Fixed fetchPayments call to pass empty object: `fetchPayments({})`

## 📦 Required Installation

You need to install the babel module resolver plugin:

```bash
npm install --save-dev babel-plugin-module-resolver
```

## 🚀 How It Works Now

### Before Running App
When you run `npm start`, it will:
1. First run `npm run typecheck` (via prestart hook)
2. If any TypeScript errors exist, it will fail and show errors
3. Only if typecheck passes, the app will start

### During Development
- TypeScript will validate all imports and types
- The `@` alias works in both TypeScript (via tsconfig.json) and at runtime (via babel)
- Wrong imports will be caught immediately

### Example Error Output
If you have a wrong import:
```
src/components/Example.tsx:5:23 - error TS2307: Cannot find module '@/services/wrong/path'
```

## 🎯 Benefits

1. **Catch errors early** - Before app runs, not during runtime
2. **Better DX** - Clear error messages in terminal
3. **Type safety** - All imports are validated
4. **Clean imports** - Use `@/` instead of `../../..`

## 📝 Next Steps

1. Install the babel plugin: `npm install --save-dev babel-plugin-module-resolver`
2. Clear metro cache: `npm start -- --clear`
3. Test the app to ensure everything works

## 🔍 Optional: ESLint Setup

For even better error detection in your IDE, you can add ESLint:

```bash
npm install --save-dev eslint eslint-plugin-import eslint-import-resolver-typescript @react-native/eslint-config
```

Create `.eslintrc.js`:
```js
module.exports = {
  root: true,
  extends: ['@react-native'],
  parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
  settings: {
    'import/resolver': {
      typescript: { project: './tsconfig.json' },
    },
  },
  rules: {
    'import/no-unresolved': 'error',
  },
};
```

Add to package.json scripts:
```json
"lint": "eslint . --ext .ts,.tsx"
```
