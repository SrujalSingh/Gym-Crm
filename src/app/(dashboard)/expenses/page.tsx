'use client';

import React, { useState } from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { ExpenseCategory } from '@/lib/types';
import { Card, Button, Input, Select, Badge, Modal } from '@/components/ui';
import { DollarSign, Plus, Calendar, Tag, FileText } from 'lucide-react';

export default function ExpensesPage() {
  const { expenses, addExpense } = useTenant();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'rent' as ExpenseCategory,
    amount: 100.00,
    expense_date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    addExpense({
      title: formData.title,
      category: formData.category,
      amount: Number(formData.amount),
      expense_date: formData.expense_date,
      description: formData.description,
    });

    setIsAddModalOpen(false);
    setFormData({ title: '', category: 'rent', amount: 100.00, expense_date: new Date().toISOString().split('T')[0], description: '' });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <span>Operational Expenses</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Track gym overheads, maintenance, salaries, and utility costs.</p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
        >
          Log Expense
        </Button>
      </div>

      {/* Expense Summary KPI */}
      <Card className="p-5 flex items-center justify-between border-rose-200 bg-rose-50/30">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Logged Expenses</p>
          <h3 className="text-3xl font-black text-rose-700 mt-1">₹{totalExpenseAmount.toFixed(2)}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600">
          <DollarSign className="w-6 h-6" />
        </div>
      </Card>

      {/* Expenses Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Date</th>
                <th className="p-4">Logged By</th>
                <th className="p-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No expense records logged.
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{e.title}</p>
                      <p className="text-[10px] text-slate-500 italic">{e.description || 'No description'}</p>
                    </td>
                    <td className="p-4">
                      <Badge variant="amber">{e.category.toUpperCase()}</Badge>
                    </td>
                    <td className="p-4 text-slate-700 font-medium">{e.expense_date}</td>
                    <td className="p-4 text-slate-500 font-medium">{e.created_by_name || 'Admin'}</td>
                    <td className="p-4 text-right font-black text-rose-700 text-sm">
                      ₹{Number(e.amount).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Log Gym Expense"
        description="Record operational costs for financial auditing."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Expense Title *"
            placeholder="e.g. Monthly Building Rent"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category *"
              value={formData.category}
              onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
              options={[
                { label: 'Rent', value: 'rent' },
                { label: 'Equipment', value: 'equipment' },
                { label: 'Utilities', value: 'utilities' },
                { label: 'Salaries', value: 'salaries' },
                { label: 'Maintenance', value: 'maintenance' },
                { label: 'Marketing', value: 'marketing' },
                { label: 'Other', value: 'other' },
              ]}
            />

            <Input
              label="Amount (₹) *"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              required
            />
          </div>

          <Input
            label="Expense Date"
            type="date"
            value={formData.expense_date}
            onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
          />

          <Input
            label="Description / Notes"
            placeholder="e.g. August landlord lease payment"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Log Expense
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
