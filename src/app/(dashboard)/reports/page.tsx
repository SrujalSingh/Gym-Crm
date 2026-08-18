'use client';

import React from 'react';
import { useTenant } from '@/lib/context/TenantContext';
import { Card, Badge } from '@/components/ui';
import { BarChart3, TrendingUp, DollarSign, Users, CalendarCheck, Percent } from 'lucide-react';

export default function ReportsPage() {
  const { payments, expenses, members, attendance, plans } = useTenant();

  const totalRevenue = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMarginPct = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-600" />
          <span>Gym Analytics & Financial Reports</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Multi-tenant financial metrics, net profit margins, and retention breakdown.</p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Revenue</p>
          <h3 className="text-2xl font-black text-emerald-700 mt-1">₹{totalRevenue.toFixed(2)}</h3>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Expenses</p>
          <h3 className="text-2xl font-black text-rose-700 mt-1">₹{totalExpenses.toFixed(2)}</h3>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Profit</p>
          <h3 className={`text-2xl font-black mt-1 ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            ₹{netProfit.toFixed(2)}
          </h3>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profit Margin</p>
          <h3 className="text-2xl font-black text-sky-700 mt-1">{profitMarginPct}%</h3>
        </Card>
      </div>

      {/* Plan Distribution Breakdown */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
          Membership Plan Distribution
        </h3>

        <div className="space-y-3">
          {plans.map((p) => {
            const count = members.filter((m) => m.membership_plan_id === p.id).length;
            const pct = members.length > 0 ? ((count / members.length) * 100).toFixed(1) : 0;
            return (
              <div key={p.id} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-800">{p.name}</span>
                  <span className="text-emerald-700 font-mono font-bold">{count} members ({pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                  <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
