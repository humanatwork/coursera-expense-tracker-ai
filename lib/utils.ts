import { Expense, ExpenseCategory, ExpenseSummary } from '@/types/expense';

export function formatCurrency(amount: number): string {
  const formatted = amount.toFixed(2);
  // Add commas for thousands
  const parts = formatted.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `$${parts.join('.')}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getMonthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
}

export function getMonthEnd(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
}

export function calculateSummary(expenses: Expense[]): ExpenseSummary {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const categoryTotals: Record<ExpenseCategory, number> = {
    Food: 0,
    Transportation: 0,
    Entertainment: 0,
    Shopping: 0,
    Bills: 0,
    Other: 0,
  };

  let total = 0;
  let monthlyTotal = 0;
  let monthlyTransactionCount = 0;

  expenses.forEach((expense) => {
    const amount = expense.amount;
    total += amount;
    categoryTotals[expense.category] += amount;

    const expenseDate = new Date(expense.date);
    if (expenseDate >= monthStart) {
      monthlyTotal += amount;
      monthlyTransactionCount++;
    }
  });

  let topCategory: ExpenseCategory | null = null;
  let maxAmount = 0;

  (Object.keys(categoryTotals) as ExpenseCategory[]).forEach((category) => {
    if (categoryTotals[category] > maxAmount) {
      maxAmount = categoryTotals[category];
      topCategory = category;
    }
  });

  return {
    total,
    monthlyTotal,
    categoryTotals,
    topCategory,
    transactionCount: expenses.length,
    monthlyTransactionCount,
  };
}

export function exportToCSV(expenses: Expense[]): void {
  if (expenses.length === 0) {
    alert('No expenses to export');
    return;
  }

  const headers = ['Date', 'Amount', 'Category', 'Description'];
  const rows = expenses.map((exp) => [
    exp.date,
    exp.amount.toString(),
    exp.category,
    exp.description,
  ]);

  const csv = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
