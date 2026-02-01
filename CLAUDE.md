# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern expense tracking web application built with Next.js 14, TypeScript, and Tailwind CSS. The application helps users manage their personal finances by tracking expenses across different categories, providing analytics, and offering export capabilities.

## Development Commands

- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Create production build
- `npm run start` - Run production server
- `npm run lint` - Run ESLint to check code quality

## Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS v4
- **State Management**: React hooks (useState, useEffect)
- **Data Persistence**: localStorage (client-side only)

### Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main application page (client component)
│   └── globals.css         # Global styles with Tailwind
├── components/             # React components
│   ├── Button.tsx          # Reusable button with variants
│   ├── Card.tsx            # Container component
│   ├── Dashboard.tsx       # Analytics dashboard with summary cards
│   ├── ExpenseForm.tsx     # Form for add/edit with validation
│   ├── ExpenseList.tsx     # List view with filtering
│   ├── Input.tsx           # Form input with error handling
│   ├── Modal.tsx           # Modal dialog component
│   └── Select.tsx          # Dropdown select component
├── lib/                    # Utilities and helpers
│   ├── storage.ts          # localStorage CRUD operations
│   └── utils.ts            # Helper functions (formatting, calculations, export)
└── types/                  # TypeScript definitions
    └── expense.ts          # Expense types and interfaces
```

### Data Model

The core data type is `Expense`:
```typescript
interface Expense {
  id: string;              // Unique identifier
  date: string;            // ISO date string
  amount: number;          // Expense amount
  category: ExpenseCategory; // One of 6 predefined categories
  description: string;     // User-provided description
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}
```

Categories: Food, Transportation, Entertainment, Shopping, Bills, Other

### Key Features

1. **Dashboard Tab**
   - Summary cards: total spending, monthly total, top category, average per transaction
   - Category breakdown with visual progress bars
   - Recent expenses list (last 5)

2. **All Expenses Tab**
   - Filterable list (search, category, date range)
   - Edit and delete functionality
   - No expenses state

3. **Expense Management**
   - Add expense via modal with validation
   - Edit existing expenses (opens in modal)
   - Delete with confirmation
   - Form validation: required fields, positive amounts, valid dates

4. **Data Export**
   - CSV export of all expenses
   - Includes date, amount, category, description

### State Management

The main page (`app/page.tsx`) manages all application state:
- `expenses`: Array of all expenses (synced with localStorage)
- `isAddModalOpen`: Controls add expense modal
- `editingExpense`: Holds expense being edited
- `activeTab`: Current tab ('dashboard' | 'expenses')

All state changes trigger localStorage updates via the `storage` utility.

### Data Flow

1. On mount: Load expenses from localStorage
2. On add/edit/delete: Update localStorage, then update state
3. Components receive expenses and callbacks as props
4. Forms handle their own validation state

### Styling Approach

- Utility-first with Tailwind CSS
- Responsive design (mobile-first)
- Component-level styling with props-based variants
- Color-coded categories for visual distinction
- Professional blue/gray color scheme

## Making Changes

### Adding a New Category

1. Update `ExpenseCategory` type in `types/expense.ts`
2. Add category to `categoryColors` in `Dashboard.tsx` and `ExpenseList.tsx`
3. Add to categories array in `ExpenseForm.tsx`

### Adding New Fields to Expenses

1. Update `Expense` interface in `types/expense.ts`
2. Update `ExpenseFormData` interface
3. Modify `ExpenseForm.tsx` to include new fields
4. Update `ExpenseList.tsx` and `Dashboard.tsx` to display new data
5. Update CSV export in `lib/utils.ts`

### Changing Storage Backend

Replace `lib/storage.ts` functions while maintaining the same interface. The rest of the app will work without changes.

## Notes

- This is a demo app using localStorage - data is client-side only
- No authentication or user management
- No backend API - fully client-side
- Mobile-responsive but optimized for desktop use
- Browser localStorage limits apply (~5-10MB depending on browser)
