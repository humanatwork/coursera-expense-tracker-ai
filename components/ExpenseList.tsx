'use client';

import { useState, useMemo } from 'react';
import { Expense, ExpenseCategory, ExpenseFilters } from '@/types/expense';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Card } from './Card';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const categoryColors: Record<ExpenseCategory, string> = {
  Food: 'bg-green-100 text-green-800',
  Transportation: 'bg-blue-100 text-blue-800',
  Entertainment: 'bg-purple-100 text-purple-800',
  Shopping: 'bg-pink-100 text-pink-800',
  Bills: 'bg-yellow-100 text-yellow-800',
  Other: 'bg-gray-100 text-gray-800',
};

export function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  const [filters, setFilters] = useState<ExpenseFilters>({
    category: 'All',
    searchQuery: '',
  });

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      // Category filter
      if (filters.category && filters.category !== 'All') {
        if (expense.category !== filters.category) return false;
      }

      // Date range filter
      if (filters.startDate) {
        if (expense.date < filters.startDate) return false;
      }
      if (filters.endDate) {
        if (expense.date > filters.endDate) return false;
      }

      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesDescription = expense.description
          .toLowerCase()
          .includes(query);
        const matchesAmount = expense.amount.toString().includes(query);
        const matchesCategory = expense.category.toLowerCase().includes(query);

        if (!matchesDescription && !matchesAmount && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [expenses, filters]);

  const handleDelete = (id: string, description: string) => {
    if (confirm(`Are you sure you want to delete "${description}"?`)) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card title="Filter Expenses">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            type="text"
            placeholder="Search..."
            value={filters.searchQuery || ''}
            onChange={(e) =>
              setFilters({ ...filters, searchQuery: e.target.value })
            }
          />

          <Select
            value={filters.category || 'All'}
            onChange={(e) =>
              setFilters({
                ...filters,
                category: e.target.value as ExpenseCategory | 'All',
              })
            }
            options={[
              { value: 'All', label: 'All Categories' },
              { value: 'Food', label: 'Food' },
              { value: 'Transportation', label: 'Transportation' },
              { value: 'Entertainment', label: 'Entertainment' },
              { value: 'Shopping', label: 'Shopping' },
              { value: 'Bills', label: 'Bills' },
              { value: 'Other', label: 'Other' },
            ]}
          />

          <Input
            type="date"
            placeholder="Start Date"
            value={filters.startDate || ''}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
          />

          <Input
            type="date"
            placeholder="End Date"
            value={filters.endDate || ''}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
          />
        </div>

        {(filters.searchQuery ||
          filters.category !== 'All' ||
          filters.startDate ||
          filters.endDate) && (
          <div className="mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setFilters({
                  category: 'All',
                  searchQuery: '',
                  startDate: '',
                  endDate: '',
                })
              }
            >
              Clear Filters
            </Button>
          </div>
        )}
      </Card>

      {/* Expense List */}
      <Card title={`Expenses (${filteredExpenses.length})`}>
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {expenses.length === 0
              ? 'No expenses yet. Add your first expense above!'
              : 'No expenses match your filters.'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        categoryColors[expense.category]
                      }`}
                    >
                      {expense.category}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatDate(expense.date)}
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium">
                    {expense.description}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(expense.amount)}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(expense)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(expense.id, expense.description)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
