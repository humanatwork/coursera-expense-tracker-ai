# Expense Tracker

A modern, professional expense tracking web application built with Next.js 14, TypeScript, and Tailwind CSS. Manage your personal finances with ease through an intuitive interface featuring analytics, filtering, and export capabilities.

## Features

### Dashboard
- **Summary Cards**: View total spending, monthly totals, top category, and average per transaction
- **Category Breakdown**: Visual representation of spending by category with percentage bars
- **Recent Activity**: Quick view of your latest expenses

### Expense Management
- **Add Expenses**: Simple form with validation for date, amount, category, and description
- **Edit Expenses**: Modify existing expenses with pre-filled forms
- **Delete Expenses**: Remove expenses with confirmation prompts
- **Smart Filtering**: Filter by date range, category, and search text

### Analytics
- **Category Insights**: See which categories consume most of your budget
- **Monthly Tracking**: Monitor current month spending separately
- **Transaction Analysis**: View average spending per transaction

### Data Export
- **CSV Export**: Download all expenses in CSV format for external analysis

### Categories
- Food
- Transportation
- Entertainment
- Shopping
- Bills
- Other

## Getting Started

### Prerequisites
- Node.js 18+ installed on your system
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd expense-tracker-ai
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit:
```
http://localhost:3000
```

### Building for Production

Create an optimized production build:
```bash
npm run build
```

Start the production server:
```bash
npm run start
```

## How to Use

### Adding Your First Expense

1. Click the "Add Expense" button in the header
2. Fill in the expense details:
   - **Date**: Select the date of the expense (cannot be in the future)
   - **Amount**: Enter the amount (must be a positive number)
   - **Category**: Choose from the dropdown menu
   - **Description**: Provide details about the expense
3. Click "Add Expense" to save

### Viewing Your Expenses

#### Dashboard Tab
- View summary statistics at the top
- See spending breakdown by category
- Check recent expenses

#### All Expenses Tab
- Browse all expenses in a list format
- Use filters to narrow down results:
  - Search by description, amount, or category
  - Filter by category
  - Filter by date range
- Click "Clear Filters" to reset all filters

### Editing an Expense

1. Navigate to the "All Expenses" tab
2. Find the expense you want to edit
3. Click the "Edit" button
4. Modify the fields in the modal
5. Click "Update Expense" to save changes

### Deleting an Expense

1. Navigate to the "All Expenses" tab
2. Find the expense you want to delete
3. Click the "Delete" button
4. Confirm the deletion in the prompt

### Exporting Data

1. Click the "Export CSV" button in the header (visible when you have expenses)
2. The CSV file will download automatically
3. Open in Excel, Google Sheets, or any spreadsheet application

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React Hooks
- **Data Storage**: Browser localStorage

## Project Structure

```
├── app/                    # Next.js pages
│   ├── page.tsx           # Main application
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Dashboard.tsx      # Analytics dashboard
│   ├── ExpenseForm.tsx    # Add/Edit form
│   ├── ExpenseList.tsx    # List with filters
│   └── ...                # UI components
├── lib/                   # Utilities
│   ├── storage.ts         # localStorage operations
│   └── utils.ts           # Helper functions
└── types/                 # TypeScript types
    └── expense.ts         # Data models
```

## Data Persistence

This application uses browser localStorage to store your expenses. This means:

- ✅ Your data stays private on your device
- ✅ No account or login required
- ✅ Works offline
- ⚠️ Data is browser-specific (not synced across devices)
- ⚠️ Clearing browser data will delete your expenses
- ⚠️ Storage limit is approximately 5-10MB

## Browser Compatibility

This application works best on modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run start` - Run production server
- `npm run lint` - Run ESLint

### Key Dependencies

- next: ^16.1.6
- react: ^19.0.0
- typescript: ^5.7.3
- tailwindcss: ^4.1.0

## License

This project is open source and available for personal and educational use.

## Support

For issues or questions, please refer to the project documentation or create an issue in the repository.
