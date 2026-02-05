# CLAUDE.md

## Project Overview

Client-side expense tracking app. Next.js 14 (App Router), TypeScript (strict), React 19, Tailwind CSS v4. All data persists in localStorage — there is no backend, no API, no database, no authentication. This is a demo/portfolio project.

## Commands

```bash
npm run dev       # Dev server at http://localhost:3000
npm run build     # Production build — primary correctness check
npm run lint      # ESLint with Next.js core-web-vitals + TypeScript rules
```

There is no test suite. No unit, integration, or e2e tests exist.

## Verification

After any code change, run `npm run build` to verify correctness. This catches TypeScript errors, unused variables, and Next.js-specific issues that `npm run lint` alone misses. Treat build failure as a blocking issue.

## Architecture

### State Management

All application state lives in `app/page.tsx` (the sole `'use client'` component) and flows down via props. There is no React Context, no state library, and no server components beyond the root layout. Maintain this centralized pattern — do not introduce Context, Zustand, Redux, or similar without explicit instruction.

### Storage Layer

`lib/storage.ts` provides synchronous CRUD over localStorage (key: `expense-tracker-data`). The interface is intentionally decoupled — to swap backends, replace only this file while keeping the same function signatures. The rest of the app will work unchanged.

### Cloud Export System — MOCKED

IMPORTANT: `CloudExportHub.tsx` and `lib/cloud-export-utils.ts` implement a full cloud export UI (Google Drive, Dropbox, OneDrive, Email, Google Sheets), but **all cloud interactions are simulated**. Functions like `connectToCloudProvider()` and `exportToCloud()` use `setTimeout` to fake async responses. Do not wire these to real APIs unless explicitly asked.

### Component Layers

- **Primitives** (`Button`, `Card`, `Input`, `Select`, `Modal`): Generic UI components with prop-based variants. Extend these when adding new UI elements.
- **Features** (`Dashboard`, `ExpenseList`, `ExpenseForm`, `CloudExportHub`): Business logic components that receive data and callbacks as props from `page.tsx`.

### Path Aliases

Use `@/*` imports (mapped to project root in `tsconfig.json`). Example: `import { cn } from '@/lib/utils'`.

## Key Conventions

### Category Colors Are Defined in Multiple Files

Category-to-color mappings exist independently in three places and must stay in sync:
- `Dashboard.tsx` — `categoryColors` object (progress bars)
- `ExpenseList.tsx` — `categoryColors` object (badges)
- `ExpenseForm.tsx` — categories array (dropdown options)

Current mapping: Food=green, Transportation=blue, Entertainment=purple, Shopping=pink, Bills=yellow, Other=gray.

### Class Merging

`lib/utils.ts` exports `cn()` for conditional Tailwind class merging. Always use it instead of manual string concatenation: `cn('base', condition && 'conditional')`.

### Tailwind CSS v4

This project uses Tailwind v4 with `@tailwindcss/postcss`. There is **no `tailwind.config.js`** — theme configuration lives in CSS variables in `app/globals.css`. Do not create a Tailwind config file.

## Workflows

### Adding a New Expense Category

1. Add to `ExpenseCategory` union in `types/expense.ts`
2. Add color entry to `categoryColors` in **both** `Dashboard.tsx` and `ExpenseList.tsx`
3. Add to the categories array in `ExpenseForm.tsx`
4. Run `npm run build` to catch exhaustiveness errors

### Adding a New Field to Expenses

1. Add field to `Expense` interface in `types/expense.ts`
2. If user-editable, also add to `ExpenseFormData`
3. Add form control to `ExpenseForm.tsx`
4. Display in `ExpenseList.tsx` and/or `Dashboard.tsx` as appropriate
5. Include in CSV export in `lib/utils.ts` → `exportToCSV()`
6. Run `npm run build`

### Replacing the Storage Backend

Replace the functions in `lib/storage.ts` while preserving the same signatures (`getExpenses`, `saveExpenses`, `addExpense`, `updateExpense`, `deleteExpense`, `clearAll`). No other files need changes.

## Gotchas

- **No SSR**: `page.tsx` is a client component. localStorage access is in `useEffect`. Do not add server-side data fetching or server actions without restructuring the component hierarchy.
- **No tests**: Changes cannot be verified by tests. `npm run build` is the only automated quality gate.
- **Cloud features are fake**: The entire export hub returns simulated success responses after artificial delays. Treat it as a UI prototype.
- **ID generation is not secure**: `generateId()` uses `Date.now().toString(36)` + random suffix. Fine for local demos, not for production multi-user scenarios.
- **Data is ephemeral**: localStorage can be cleared by the browser at any time. No backup, sync, or recovery mechanism exists.
- **Duplicate category maps**: Changing a category color in one file but not the others will cause visual inconsistency. See "Category Colors" above.
- **Empty `hooks/` directory**: Exists but contains no files. Created as a placeholder for future custom React hooks.
