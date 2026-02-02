import { Expense, ExpenseCategory } from '@/types/expense';
import { formatCurrency, formatDate } from './utils';

export type ExportFormat = 'csv' | 'json' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  filename: string;
  startDate?: string;
  endDate?: string;
  categories: ExpenseCategory[];
  includeAllCategories: boolean;
}

export function filterExpensesForExport(
  expenses: Expense[],
  options: ExportOptions
): Expense[] {
  return expenses.filter((expense) => {
    // Date range filter
    if (options.startDate && expense.date < options.startDate) {
      return false;
    }
    if (options.endDate && expense.date > options.endDate) {
      return false;
    }

    // Category filter
    if (!options.includeAllCategories) {
      if (!options.categories.includes(expense.category)) {
        return false;
      }
    }

    return true;
  });
}

export function exportAsCSV(expenses: Expense[], filename: string): void {
  const headers = ['Date', 'Category', 'Amount', 'Description', 'Created At', 'Updated At'];
  const rows = expenses.map((exp) => [
    exp.date,
    exp.category,
    exp.amount.toString(),
    exp.description.replace(/"/g, '""'), // Escape quotes
    exp.createdAt,
    exp.updatedAt,
  ]);

  const csv = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  downloadFile(csv, `${filename}.csv`, 'text/csv');
}

export function exportAsJSON(expenses: Expense[], filename: string): void {
  const data = {
    exportDate: new Date().toISOString(),
    totalRecords: expenses.length,
    totalAmount: expenses.reduce((sum, exp) => sum + exp.amount, 0),
    expenses: expenses,
  };

  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `${filename}.json`, 'application/json');
}

export function exportAsPDF(expenses: Expense[], filename: string): void {
  // Generate a formatted text document optimized for PDF conversion
  const lines: string[] = [];

  lines.push('EXPENSE REPORT');
  lines.push('='.repeat(80));
  lines.push('');
  lines.push(`Export Date: ${new Date().toLocaleString()}`);
  lines.push(`Total Records: ${expenses.length}`);
  lines.push(`Total Amount: ${formatCurrency(expenses.reduce((sum, exp) => sum + exp.amount, 0))}`);
  lines.push('');
  lines.push('='.repeat(80));
  lines.push('');

  // Group by category
  const categories = [...new Set(expenses.map(e => e.category))];

  categories.forEach(category => {
    const categoryExpenses = expenses.filter(e => e.category === category);
    const categoryTotal = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    lines.push(`\n${category.toUpperCase()}`);
    lines.push('-'.repeat(80));
    lines.push(`Total: ${formatCurrency(categoryTotal)} (${categoryExpenses.length} transactions)`);
    lines.push('');

    categoryExpenses.forEach(exp => {
      lines.push(`  ${formatDate(exp.date)} - ${formatCurrency(exp.amount)}`);
      lines.push(`  ${exp.description}`);
      lines.push('');
    });
  });

  lines.push('='.repeat(80));
  lines.push('END OF REPORT');

  const content = lines.join('\n');

  // Create HTML for better PDF rendering
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${filename}</title>
  <style>
    body {
      font-family: 'Courier New', monospace;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    pre {
      white-space: pre-wrap;
      line-height: 1.6;
    }
    @media print {
      body { padding: 20px; }
    }
  </style>
</head>
<body>
  <pre>${content}</pre>
  <script>
    // Auto-print for PDF generation
    window.onload = function() {
      setTimeout(() => {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;

  // Open in new window for printing to PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export function getExportSummary(expenses: Expense[]) {
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categories = [...new Set(expenses.map(e => e.category))];
  const dateRange = expenses.length > 0 ? {
    earliest: expenses.reduce((min, exp) => exp.date < min ? exp.date : min, expenses[0].date),
    latest: expenses.reduce((max, exp) => exp.date > max ? exp.date : max, expenses[0].date),
  } : null;

  return {
    recordCount: expenses.length,
    totalAmount: total,
    categoryCount: categories.length,
    dateRange,
  };
}
