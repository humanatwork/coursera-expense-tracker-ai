'use client';

import { Expense, ExpenseCategory } from '@/types/expense';
import { formatCurrency, calculateSummary } from '@/lib/utils';
import { Card } from './Card';

interface DashboardProps {
  expenses: Expense[];
}

const categoryColors: Record<ExpenseCategory, string> = {
  Food: 'bg-green-500',
  Transportation: 'bg-blue-500',
  Entertainment: 'bg-purple-500',
  Shopping: 'bg-pink-500',
  Bills: 'bg-yellow-500',
  Other: 'bg-gray-500',
};

export function Dashboard({ expenses }: DashboardProps) {
  const summary = calculateSummary(expenses);

  const categoryData = (Object.keys(summary.categoryTotals) as ExpenseCategory[])
    .map((category) => ({
      category,
      amount: summary.categoryTotals[category],
      percentage:
        summary.total > 0
          ? (summary.categoryTotals[category] / summary.total) * 100
          : 0,
    }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex flex-col">
            <span className="text-sm text-gray-600 mb-1">Total Spending</span>
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.total)}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              {summary.transactionCount} transactions
            </span>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col">
            <span className="text-sm text-gray-600 mb-1">This Month</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.monthlyTotal)}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              {summary.monthlyTransactionCount} transactions
            </span>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col">
            <span className="text-sm text-gray-600 mb-1">Top Category</span>
            <span className="text-2xl font-bold text-purple-600">
              {summary.topCategory || 'N/A'}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              {summary.topCategory
                ? formatCurrency(summary.categoryTotals[summary.topCategory])
                : ''}
            </span>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col">
            <span className="text-sm text-gray-600 mb-1">Average/Transaction</span>
            <span className="text-2xl font-bold text-green-600">
              {summary.transactionCount > 0
                ? formatCurrency(summary.total / summary.transactionCount)
                : formatCurrency(0)}
            </span>
            <span className="text-xs text-gray-500 mt-1">per expense</span>
          </div>
        </Card>
      </div>

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <Card title="Spending by Category">
          <div className="space-y-4">
            {categoryData.map(({ category, amount, percentage }) => (
              <div key={category}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {category}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(amount)}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${categoryColors[category]}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      {expenses.length > 0 && (
        <Card title="Recent Expenses">
          <div className="space-y-3">
            {expenses.slice(0, 5).map((expense) => (
              <div
                key={expense.id}
                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {expense.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {expense.category} • {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {formatCurrency(expense.amount)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
