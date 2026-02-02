'use client';

import { useState, useMemo } from 'react';
import { Expense, ExpenseCategory } from '@/types/expense';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ExportFormat,
  ExportOptions,
  filterExpensesForExport,
  exportAsCSV,
  exportAsJSON,
  exportAsPDF,
  getExportSummary,
} from '@/lib/advanced-export';

interface AdvancedExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
}

const allCategories: ExpenseCategory[] = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
];

export function AdvancedExportModal({
  isOpen,
  onClose,
  expenses,
}: AdvancedExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [filename, setFilename] = useState('expense-export');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [includeAllCategories, setIncludeAllCategories] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<ExpenseCategory[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const exportOptions: ExportOptions = {
    format,
    filename,
    startDate,
    endDate,
    categories: selectedCategories,
    includeAllCategories,
  };

  const filteredExpenses = useMemo(
    () => filterExpensesForExport(expenses, exportOptions),
    [expenses, exportOptions]
  );

  const summary = useMemo(
    () => getExportSummary(filteredExpenses),
    [filteredExpenses]
  );

  const toggleCategory = (category: ExpenseCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleExport = async () => {
    if (filteredExpenses.length === 0) {
      alert('No expenses to export with current filters');
      return;
    }

    setIsExporting(true);

    // Simulate processing time for better UX
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      switch (format) {
        case 'csv':
          exportAsCSV(filteredExpenses, filename);
          break;
        case 'json':
          exportAsJSON(filteredExpenses, filename);
          break;
        case 'pdf':
          exportAsPDF(filteredExpenses, filename);
          break;
      }

      // Close modal after successful export
      setTimeout(() => {
        onClose();
        setIsExporting(false);
      }, 1000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
      setIsExporting(false);
    }
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setIncludeAllCategories(true);
    setSelectedCategories([]);
    setShowPreview(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Advanced Export" size="lg">
      <div className="space-y-6">
        {/* Export Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['csv', 'json', 'pdf'] as ExportFormat[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  format === fmt
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold uppercase text-sm">
                  {fmt}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {fmt === 'csv' && 'Spreadsheet format'}
                  {fmt === 'json' && 'Data format'}
                  {fmt === 'pdf' && 'Print-ready report'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Filename Input */}
        <Input
          label="Filename"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="expense-export"
        />

        {/* Date Range Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Date Range (Optional)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Categories
          </label>
          <div className="mb-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeAllCategories}
                onChange={(e) => setIncludeAllCategories(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Include all categories</span>
            </label>
          </div>

          {!includeAllCategories && (
            <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg">
              {allCategories.map((category) => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="mr-2 h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Export Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-3">Export Summary</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-blue-700">Records:</span>{' '}
              <span className="font-bold text-blue-900">{summary.recordCount}</span>
            </div>
            <div>
              <span className="text-blue-700">Total Amount:</span>{' '}
              <span className="font-bold text-blue-900">
                {formatCurrency(summary.totalAmount)}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Categories:</span>{' '}
              <span className="font-bold text-blue-900">{summary.categoryCount}</span>
            </div>
            {summary.dateRange && (
              <div>
                <span className="text-blue-700">Date Range:</span>{' '}
                <span className="font-bold text-blue-900 text-xs">
                  {formatDate(summary.dateRange.earliest)} -{' '}
                  {formatDate(summary.dateRange.latest)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Preview Toggle */}
        <div>
          <Button
            variant="ghost"
            onClick={() => setShowPreview(!showPreview)}
            className="w-full"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>

        {/* Preview Table */}
        {showPreview && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <h4 className="font-semibold text-gray-900">
                Preview ({filteredExpenses.length} records)
              </h4>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {filteredExpenses.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No expenses match your filters
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                        Category
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700">
                        Amount
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredExpenses.slice(0, 50).map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap">
                          {formatDate(expense.date)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {expense.category}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-right font-medium">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-4 py-2 truncate max-w-xs">
                          {expense.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {filteredExpenses.length > 50 && (
                <div className="px-4 py-2 bg-gray-50 text-xs text-gray-600 text-center border-t">
                  Showing first 50 of {filteredExpenses.length} records
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="ghost" onClick={resetFilters} className="flex-1">
            Reset Filters
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            className="flex-1"
            disabled={isExporting || filteredExpenses.length === 0}
          >
            {isExporting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 inline"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Exporting...
              </>
            ) : (
              `Export ${format.toUpperCase()}`
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
