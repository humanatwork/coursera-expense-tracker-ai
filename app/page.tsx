'use client';

import { useState, useEffect } from 'react';
import { Expense } from '@/types/expense';
import { storage } from '@/lib/storage';
import { Dashboard } from '@/components/Dashboard';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExpenseList } from '@/components/ExpenseList';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CloudExportHub } from '@/components/CloudExportHub';

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCloudExportOpen, setIsCloudExportOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses'>('dashboard');

  // Load expenses from localStorage on mount
  useEffect(() => {
    const loadedExpenses = storage.getExpenses();
    setExpenses(loadedExpenses);
  }, []);

  const handleAddExpense = (expense: Expense) => {
    const newExpenses = storage.addExpense(expense);
    setExpenses(newExpenses);
    setIsAddModalOpen(false);
  };

  const handleEditExpense = (expense: Expense) => {
    const newExpenses = storage.updateExpense(expense.id, expense);
    setExpenses(newExpenses);
    setEditingExpense(null);
  };

  const handleDeleteExpense = (id: string) => {
    const newExpenses = storage.deleteExpense(id);
    setExpenses(newExpenses);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Expense Tracker
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your personal finances
              </p>
            </div>
            <div className="flex gap-2">
              {expenses.length > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => setIsCloudExportOpen(true)}
                  className="relative"
                >
                  <svg
                    className="w-4 h-4 mr-2 inline"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Export & Share
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    Pro
                  </span>
                </Button>
              )}
              <Button onClick={() => setIsAddModalOpen(true)}>
                Add Expense
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('expenses')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'expenses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Expenses
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <>
            {expenses.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No expenses yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by adding your first expense.
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => setIsAddModalOpen(true)}>
                      Add Your First Expense
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Dashboard expenses={expenses} />
            )}
          </>
        )}

        {activeTab === 'expenses' && (
          <ExpenseList
            expenses={expenses}
            onEdit={setEditingExpense}
            onDelete={handleDeleteExpense}
          />
        )}
      </main>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Expense"
      >
        <ExpenseForm onSubmit={handleAddExpense} />
      </Modal>

      {/* Edit Expense Modal */}
      <Modal
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        title="Edit Expense"
      >
        {editingExpense && (
          <ExpenseForm
            onSubmit={handleEditExpense}
            initialData={editingExpense}
            submitLabel="Update Expense"
          />
        )}
      </Modal>

      {/* Cloud Export Hub */}
      <CloudExportHub
        isOpen={isCloudExportOpen}
        onClose={() => setIsCloudExportOpen(false)}
        expenses={expenses}
      />
    </div>
  );
}
